import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

type AccountType = 'assets' | 'liabilities' | 'equity' | 'revenue' | 'expenses';

const accountTypePrefixes: Record<AccountType, string> = {
 assets: '1',
  liabilities: '2',
  equity: '3',
  revenue: '4',
  expenses: '5',
};

function prefixAccountNumber(accountType: AccountType, accountNumber: number): string {
    const prefix = accountTypePrefixes[accountType];
    return `${prefix}${accountNumber.toString()}`;
}

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
  if (req.method == "POST") {
    // Create Account, returns the whole object if successful.
    //Given 123, we have to add a "1" as a prefix to the account number. 
    const query = req.query;
    let body = JSON.parse(req.body);
    const accountNumber = prefixAccountNumber(body.account_category, body.account_number);
    body.account_number = accountNumber;

    try {
        console.log(body);
        const {data, error} = await supabase.from(`accounts`).insert([{...body, last_modified_by: query.user_id, balance: body.initial_balance}]);
        if(error) throw error;
        res.status(200).json({message: "All Good"});
    }catch(error: any){
        res.status(500).json({error: error.error_description || error.message})
    }
  }
  if(req.method == "GET"){
    // Get account info, will expect ID as a query param.
  }

  if(req.method == "PUT"){
    // Update account, will also require ID as a query param.
    const query = req.query;
    const body = JSON.parse(req.body);
    console.log(query);
    console.log(body);

    try{
      let { data, error } = await supabase.from(`accounts`).update({...body, last_modified_by: query.user_id}).eq("id", query.id); 
      console.log(data);
      if (error) throw error;
      res.status(200).json({message: "all good"});
    }catch(error: any){
      res.status(500).json({error: error.error_description || error.message});
    }
  }

  if(req.method == "DELETE"){
    // Archives account, will probably move to an archived table. Requires ID as a query param.
    const query = req.query;
    try {
      let {data: balance, error: balanceError} = await supabase.from(`accounts`).select("balance").eq('id', query.id);
      console.log(balance);
      if(balance !== null && balance[0].balance > 0){
        res.status(409).json({error: "Cannot delete account with balance greater than 0."});
        return;
      }
      let {data, error} = await supabase.from(`accounts`).update({archived: true, last_modified_by: query.user_id}).eq('id', query.id);
      if(error) throw error;
      res.status(200).json({message: "deleted"});
    }catch (error: any){
      res.status(500).json({error: error.error_description || error.message});
    }
 
  }

}
