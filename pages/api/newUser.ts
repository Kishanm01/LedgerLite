import { createClient } from "@supabase/supabase-js";
import sgMail from '@sendgrid/mail';
import { NextApiRequest, NextApiResponse } from "next";

type NewUserBody = {
    firstName: string;
    lastName: string;
    dob: string;
    address: string;
    email: string;
    password: string;
    id: number;
  };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(process.env?.SENDGRID_API_KEY == null){
        res.status(500).send("No sendgrid api key");
    }
    sgMail.setApiKey(process.env?.SENDGRID_API_KEY || "");
    // we are using the service role key, this is kinda like admin level priveleges.
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SERVICE_ROLE_KEY || "");
    if(req.method == "POST"){
        // req.on("data")
        // get the admin emails so we know who to notify.
        const {firstName, lastName, dob, address, meail, password, id} = req.body[0];
        try{
            // console.log(req.body);
            const {data, error} = await supabase
            .from(`profiles`)
            .select(`email`)
            .eq("role", "admin");

            console.log("Admin emails:", data);
            
            let emails = [""];
            if(data != null){
                emails = data?.map(obj => obj.email);
            }


            const msg = {
                to: emails, // Change to your recipient
                from: 'admin@ledgerlite.us', // Change to your verified sender
                subject: `${firstName} wants to join you`,
                text: `${firstName} wants to join you on ledgerlite, click the link to approve or deny their request.`,
                html: `<body>
                <p>${firstName} wants to join you on LedgerLite, click the <a href='https://ledgerlite.us/admin' target='_blank'>here</a> to approve or deny their request</p>
                </body>`,
              }

              const res = await sgMail.send(msg);

              console.log(res);
        }catch(error){
            res.status(500).send("not good.");
            throw error;
        }finally{
            res.status(200).send("all good");
        }
    }

  }