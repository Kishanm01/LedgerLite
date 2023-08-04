import { createClient } from "@supabase/supabase-js";
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

  if(req.method == "PUT"){
    const body = JSON.parse(req.body);
    const query = req.query;
    try{
        const {data, error} = await supabase.from(`profiles`).update({...body}).eq("id", query.id ?? "");
        res.status(202).json({"message": "All Good"});
    }catch(error: any){
        res.status(500).json({"error": error});
    }

  }
}
