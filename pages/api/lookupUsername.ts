import { createClient } from "@supabase/supabase-js";
import sgMail from "@sendgrid/mail";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    if(req.method == "GET"){
        const query = req.query;
        let {data, error} = await supabase.from("profiles").select("email").eq("username", query.username);
        if(data?.length !== undefined && data?.length > 0){
            res.status(200).json(data[0]);
        }else{
            res.status(404).json({email: null, error: "User not found"});
        }
    }
}
