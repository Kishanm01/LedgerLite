import { createClient } from "@supabase/supabase-js";
import sgMail from "@sendgrid/mail";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { promises as fs } from "fs";
export const FormidableError = formidable.errors.FormidableError;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env?.SENDGRID_API_KEY == null) {
    res.status(500).send("No sendgrid api key");
  }
  sgMail.setApiKey(process.env?.SENDGRID_API_KEY || "");
  console.log(process.env.SENDGRID_API_KEY);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SERVICE_ROLE_KEY || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  if (req.method == "POST") {
    try {
      const { fields, files } = await parseForm(req);
      console.log(files);
      const { rows, user, type, entry_date } = fields;
      //@ts-ignore
      const parsedRows = JSON.parse(rows);

      const filteredRows = parsedRows.filter((row: any) => {
        return !(
          row.account_name.trim() === "" &&
          row.debit === null &&
          row.credit === null
        );
      });

      const { data: insertedEntry, error: insertError } = await supabase
        .from("journal_entry")
        .insert({ created_by: user, status: "pending", type: type, entry_date: entry_date })
        .select();

      if (insertError) {
        console.error(insertError);
        throw new Error("Failed to insert entry");
      }

      const entryId = insertedEntry[0].id;
      console.log("Entry ID:", entryId);

      let attachmentUrl = null;
      if (files && files.file) {
        const file = files.file;
        //@ts-ignore
        const fileName = `${entryId}/${file.originalFilename}`;
        //@ts-ignore
        const filePath = file.filepath; // <--- the path to the uploaded file
        const fileContents = await fs.readFile(filePath); // <--- read the file contents
        const { data: uploadedFile, error: uploadError } =
          await supabase.storage
            .from("attachments")
            .upload(fileName, fileContents, { upsert: true });

        if (uploadError) {
          console.error(uploadError);
          throw new Error("Failed to upload file");
        }

        const { data: publicUrl } = await supabase.storage
          .from("attachments")
          .getPublicUrl(`${fileName}`);
        attachmentUrl = publicUrl.publicUrl;
      }

      if (attachmentUrl) {
        const { error: updateError } = await supabase
          .from("journal_entry")
          .update({ file_url: attachmentUrl })
          .eq("id", entryId);

        if (updateError) {
          console.error(updateError);
          throw new Error("Failed to update entry");
        }
      }

      const lineItems = filteredRows.map((row: any) => ({
        journal_entry_id: entryId,
        account_name: row.account_name,
        account_number: row.account_number,
        debit_amount: row.debit,
        credit_amount: row.credit,
        desc: row.desc,
        type: type,
        entry_date: entry_date
      }));

      const { error: insertLineItemsError } = await supabase
        .from("journal_line_item")
        .insert(lineItems);

      if (insertLineItemsError) {
        console.error(insertLineItemsError);
        throw new Error("Failed to insert line items");
      }
      const { data: managers, error: getManagerError } = await supabase
        .from(`profiles`)
        .select("email")
        .eq("role", "manager");

      if (getManagerError) {
        console.log(getManagerError);
        throw new Error("Failed to fetch managers to send them an email");
      }

      const managerEmails: string[] = managers.map((manager) => manager.email);

      console.log(managers);
      console.log(managerEmails);

      const msg = {
        to: managerEmails,
        from: "admin@ledgerlite.us",
        subject: `A new journal entry has been submitted`,
        text: `There is a new journal entry that is ready for you to review, please login to check it out.`,
        html: `<body>
                    <p>There is a new journal entry that is ready for you to review, please <a href='https://ledgerlite.us/login' target='_blank'>login</a> to check it out.</p>
                    </body>`,
      };

      sgMail.send(msg);

      res.status(200).json({
        data: {
          url: attachmentUrl || "",
        },
        error: null,
      });
    } catch (e) {
      if (e instanceof FormidableError) {
        res.status(e.httpCode || 400).json({ data: null, error: e.message });
      } else {
        console.error(e);
        res.status(500).json({ data: null, error: "Internal Server Error" });
      }
    }
  }

  if (req.method === "PUT" && req.query.status === "approved") {
    const { id: journalEntryId, approvedBy, modifiedBy } = req.query;

    try {
      const { data: journalEntry, error: entryError } = await supabase
        .from("journal_entry")
        .select("*")
        .eq("id", journalEntryId)
        .single();

      if (entryError) {
        console.error(entryError);
        throw new Error("Failed to fetch journal entry");
      }

      const { data: lineItems, error: lineItemsError } = await supabase
        .from("journal_line_item")
        .select("*")
        .eq("journal_entry_id", journalEntryId);

      if (lineItemsError) {
        console.error(lineItemsError);
        throw new Error("Failed to fetch journal line items");
      }

      const updatePromises = [];

      for (const lineItem of lineItems) {
        const { account_number, debit_amount, credit_amount } = lineItem;

        if (!account_number) {
          throw new Error(
            `Line item with id ${lineItem.id} is missing an account number`
          );
        }

        const { data: account, error: accountError } = await supabase
          .from("accounts")
          .select("*")
          .eq("account_number", account_number)
          .single();

        if (accountError) {
          console.error(accountError);
          throw new Error(
            `Failed to fetch account with account number ${account_number}`
          );
        }

        if (account.normal_side === "debit") {
          const balance =
            account.balance + (debit_amount || 0) - (credit_amount || 0);

          updatePromises.push(
            supabase
              .from("accounts")
              .update({ balance, last_modified_by: modifiedBy, last_approved_by: approvedBy })
              .eq("account_number", account_number)
          );
        } else {
          const balance =
            account.balance - (debit_amount || 0) + (credit_amount || 0);

          updatePromises.push(
            supabase
              .from("accounts")
              .update({ balance, last_modified_by: modifiedBy, last_approved_by: approvedBy})
              .eq("account_number", account_number)
          );
        }
      }

      const { error: updateError } = await supabase
        .from("journal_entry")
        .update({ status: "approved" })
        .eq("id", journalEntryId);

      if (updateError) {
        console.error(updateError);
        throw new Error("Failed to update journal entry status");
      }

      console.log(updatePromises);

      await Promise.all(updatePromises);

      res.status(200).json({
        data: null,
        error: null,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ data: null, error: "Internal Server Error" });
    }
  }

  if (req.method === "PUT" && req.query.status === "rejected") {
    const { id, reason } = req.query;

    console.log(id);

    const { data: _, error } = await supabase
      .from(`journal_entry`)
      .update([{ status: "rejected", rejected_reason: reason }])
      .eq("id", id);

    //get the email of the person who made it
    const {
      data:
      userEmail,
      error: getUserEmailError,
    } = await supabase
      .from("profiles")
      .select(
        "email, id, journal_entry!inner(id, created_by)"
      )
      .eq("journal_entry.id", id).single();

      // console.log("User Email: ", userEmail.email);
      const msg = {
        to: userEmail?.email ?? "adming@ledgelite.us",
        from: "admin@ledgerlite.us",
        subject: `Journal entry #${id} has been rejected`,
        text: `Your journal entry has been rejected for the following reason: ${reason}, please login to view more information`,
        html: `<body>
                    <p>Your journal entry has been rejected for the following reason: ${reason}, please login  <a href='https://ledgerlite.us/login' target='_blank'>login</a> to view more information</p>
                    </body>`,
      };

      sgMail.send(msg);

      res.status(200).json({"text": "all good"});

  }
}

export const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      }
      resolve({ fields, files });
    });
  });
};
