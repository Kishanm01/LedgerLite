import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import generateIncomeStatementReport from "./reports/IncomeStatement";
import generateBalanceSheetReport from "./reports/BalanceSheet";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());
  return `${year}-${month}-${day}`;
};
const padNumber = (num: number) => {
  return num.toString().padStart(2, "0");
};

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
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDateString = formatDate(firstDayOfMonth);
    const endDateString = formatDate(today);

    const incomeStatement = await generateIncomeStatementReport(supabase, {
      start: startDateString,
      end: endDateString,
    });

    const revenueTotal = Object.values(incomeStatement.revenue).reduce(
      (acc, { balance }) => acc + balance,
      0
    );
    const cogsTotal = Object.values(incomeStatement.expenses).reduce(
      (acc, { balance }) => acc + balance,
      0
    );

    const grossProfit = revenueTotal - cogsTotal;
    const grossProfitMargin = grossProfit / revenueTotal;

    const netIncome = incomeStatement.net_income;

    const balanceSheet = await generateBalanceSheetReport(supabase, {start: startDateString, end: endDateString});


    console.log(balanceSheet);
    const currentRatio = balanceSheet.total_assets / balanceSheet.total_liabilities;
    const debtToEquity = balanceSheet.total_liabilities / balanceSheet.total_equity;

    res
      .status(200)
      .json({
        grossProfit: {title: "Gross Profit" , value: grossProfit},
        grossProfitMargin: {title: "Gross Profit Margin", value: grossProfitMargin},
        currentRatio: {title: "Current Ratio", value: currentRatio},
        debtToEquity: {title: "Debt to Equity", value: debtToEquity}
      });
  }
}
