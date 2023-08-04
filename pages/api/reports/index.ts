import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import generateBalanceSheetReport from "./BalanceSheet";
import generateTrialBalance from "./TrialBalance";
import generateIncomeStatementReport from "./IncomeStatement";
import generateTrialBalancePDF from "./TrialBalancePDF";
import generateIncomeStatementPDF from "./IncomeStatementPDF";
import generatePDFDocument from "./BalanceSheetPDF";

type ReportsType =
  | "balanceSheet"
  | "trialBalance"
  | "incomeStatement"
  | "retainedEarnings";

export interface Account {
  id: string;
  name: string;
  category: AccountType;
  initial_balance: number;
}

type AccountType = "assets" | "liabilities" | "equity" | "revenue" | "expenses";
export interface BalanceSheetReport {
  assets: {
    [accountId: string]: {
      name: string;
      balance: number;
    };
  };
  liabilities: {
    [accountId: string]: {
      name: string;
      balance: number;
    };
  };
  equity: {
    [accountId: string]: {
      name: string;
      balance: number;
    };
  };
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
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

  if (req.method == "GET") {
    const { reportType, start, end } = req.query;
    switch (reportType) {
      case "balanceSheet": {
        try {
          const balanceSheet = await generateBalanceSheetReport(supabase, {
            start: start as string,
            end: end as string,
          });

          const balanceSheetPdf = await generatePDFDocument(
            balanceSheet,
            start as string,
            end as string,
          );
      
          const pdfName = `balance-sheet${start}-${end}.pdf`;

          balanceSheetPdf.getBlob(async (blob) => {
            const buffer = await blob.arrayBuffer();
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("reports")
              .upload(pdfName, buffer, { contentType: "application/pdf", upsert: true});
            if (uploadError) {
              console.error(uploadError);
            }
          });
        
          const { data: publicUrl } = await supabase.storage
            .from("reports")
            .getPublicUrl(pdfName);
          res.status(200).json({ ...publicUrl });
        } catch (error: any) {
        //   console.error(error);
          res.status(500).json({ error: error });
        }
        break;
      }
      case "trialBalance": {
        try {
          const trialBalance = await generateTrialBalance(supabase, {start: start as string, end: end as string});
          console.log(trialBalance);

          const pdfName = `trial-balance-${start}-${end}.pdf`;
          const trialBalancePDF = await generateTrialBalancePDF(trialBalance, start as string, end as string);
        
          trialBalancePDF.getBlob(async (blob) => {
            const buffer = await blob.arrayBuffer();
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("reports")
              .upload(pdfName, buffer, { contentType: "application/pdf", upsert: true});
            if (uploadError) {
              console.error(uploadError);
            }
          });
        
          const { data: publicUrl } = await supabase.storage
            .from("reports")
            .getPublicUrl(pdfName);
          res.status(200).json({...publicUrl});
        }catch (error: any) {
          //   console.error(error);
            res.status(500).json({ error: error });
          }
          break;
      }
      case "incomeStatement": {
        try {
          const incomeStatement = await generateIncomeStatementReport(supabase, {start: start as string, end: end as string});
          // console.log(incomeStatement);
          const pdfName = `income-statement-${start}-${end}.pdf`;
          const incomeStatementPDF = await generateIncomeStatementPDF(incomeStatement, start as string, end as string);
        
          incomeStatementPDF.getBlob(async (blob) => {
            const buffer = await blob.arrayBuffer();
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("reports")
              .upload(pdfName, buffer, { contentType: "application/pdf", upsert: true});
            if (uploadError) {
              console.error(uploadError);
            }
          });
        
          const { data: publicUrl } = await supabase.storage
            .from("reports")
            .getPublicUrl(pdfName);
          res.status(200).json({...publicUrl});

          res.status(200);
        }catch (error: any) {
          //   console.error(error);
            res.status(500).json({ error: error });
          }
          break;
      }
      default:
        res.status(400).json({ error: "Invalid report type" });
        break;
    }
  }
}


