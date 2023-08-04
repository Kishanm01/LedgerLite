import { SupabaseClient } from "@supabase/supabase-js";
import generateIncomeStatementReport from "./IncomeStatement";

interface IncomeStatementReport {
  revenue: {
    [accountId: string]: {
      name: string;
      amount: number;
    };
  };
  expenses: {
    [accountId: string]: {
      name: string;
      amount: number;
    };
  };
  net_income: number;
}

interface BalanceSheetReport {
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

interface TrialBalanceReport {
  accounts: {
    [accountId: string]: {
      name: string;
      balance: number;
      normal_side: "debit" | "credit";
    };
  };
  total_debit: number;
  total_credit: number;
}

const generateRetainedEarningsReport = async (
  supabase: SupabaseClient<any, "public", any>,
  dateRange: { start: string; end: string }
) => {
  // Get the start and end date of the previous month
  const date = new Date(dateRange.start);
  const prevMonthStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const prevMonthEnd = new Date(date.getFullYear(), date.getMonth(), 0);

  // Generate the income statement for the previous month
  const incomeStatement = await generateIncomeStatementReport(supabase, {
    start: prevMonthStart.toISOString(),
    end: prevMonthEnd.toISOString(),
  });

  

  return;
};

export default generateRetainedEarningsReport;
