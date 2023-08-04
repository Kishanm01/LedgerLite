import { createClient } from "@supabase/supabase-js";
import sgMail from "@sendgrid/mail";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env?.SENDGRID_API_KEY == null) {
    res.status(500).send("No sendgrid api key");
  }
  sgMail.setApiKey(process.env?.SENDGRID_API_KEY || "");

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
    // check if a password was provided in api call
    // if not, then have to send them to a specific page.
    // Also, create username here.
    if (req.body.password) {
        // creating the username for the user.
      let usernameBuilder: string = "";
      const now = new Date();
      const currentYear = now.getFullYear().toString().substr(-2);
      const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');

      usernameBuilder += req.body.metadata.first_name.charAt(0);
      usernameBuilder += req.body.metadata.last_name;
    
      usernameBuilder += currentYear.toString();
      usernameBuilder += currentMonth.toString();
      console.log("username: ", usernameBuilder);
      const { data, error } = await supabase.auth.admin.createUser({
        email: req.body.email,
        password: req.body.password,
        email_confirm: true,
        user_metadata: {
          ...req.body.metadata,
          full_name: req.body.metadata.first_name + " " + req.body.metadata.last_name,
          username: usernameBuilder
        },
      });
      if (error == null) {
        await supabase
          .from("userRequests")
          .delete()
          .eq("id", parseInt(req.body.id));
        const msg = {
          to: req.body.email, // Change to your recipient
          from: "admin@ledgerlite.us", // Change to your verified sender
          subject: `Your account has been created`,
          text: `Congrats! Your account at LedgerLite has been created!, Login with your username: ${usernameBuilder}`,
          html: `<body>
                    <p>Congrats! Your account at LedgerLite has been created! Login <a href='https://ledgerlite.us/login' target='_blank'>here</a> with your username: ${usernameBuilder} to access your account.</p>
                    </body>`,
        };
        await sgMail.send(msg);
        res
          .status(200)
          .json({
            message: "Successfully created user and deleted the request.",
          });
      }else {
        res.status(500).json({...error});
      }
    }
  }
}
