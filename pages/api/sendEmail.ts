import sgMail from "@sendgrid/mail";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(process.env?.SENDGRID_API_KEY == null){
        res.status(500).send("No sendgrid api key");
    }
    sgMail.setApiKey(process.env?.SENDGRID_API_KEY || "");
  if (req.method === "POST") {
    const { to, body, sender } = JSON.parse(req.body);

    if (!to || !body || !sender) {
      return res.status(400).json({ error: "Missing fields in request body" });
    }

    const msg = {
      to: to,
      from: "admin@ledgerlite.us",
      subject: `${sender.full_name} sent you an email.`,
      text: body,
    };

    try {
      await sgMail.send(msg);
      return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to send email" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
