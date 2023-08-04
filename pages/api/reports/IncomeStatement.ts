import { SupabaseClient } from "@supabase/supabase-js";


export interface IncomeStatementReport {
    revenue: Record<string, { name: string; balance: number }>;
    expenses: Record<string, { name: string; balance: number }>;
    net_income: number;
  }

  
const generateIncomeStatementReport = async (
  supabase: SupabaseClient<any, "public", any>,
  dateRange: { start: string; end: string }
) => {
  const { data: revenueAccounts, error: revenueAccountsError } = await supabase
    .from("accounts")
    .select("*")
    .eq("account_category", "revenue");

  const { data: expenseAccounts, error: expenseAccountsError } = await supabase
    .from("accounts")
    .select("*")
    .eq("account_category", "expenses");

  if (revenueAccountsError || expenseAccountsError) {
    console.error(revenueAccountsError || expenseAccountsError);
    throw new Error("Could not fetch accounts");
  }

  const { data: revenueJournalEntries, error: revenueJournalEntriesError } =
    await supabase
      .from("journal_line_item")
      .select("*, journal_entry!inner(status)")
      .eq("journal_entry.status", "approved")
      .in(
        "account_number",
        revenueAccounts.map((account) => account.account_number)
      )
      .gte("entry_date", dateRange.start)
      .lte("entry_date", dateRange.end);

  const { data: expenseJournalEntries, error: expenseJournalEntriesError } =
    await supabase
      .from("journal_line_item")
      .select("*, journal_entry!inner(status)")
      .eq("journal_entry.status", "approved")
      .in(
        "account_number",
        expenseAccounts.map((account) => account.account_number)
      )
      .gte("entry_date", dateRange.start)
      .lte("entry_date", dateRange.end);

  if (revenueJournalEntriesError || expenseJournalEntriesError) {
    throw new Error("Could not fetch journal entries");
  }

  const incomeStatement: IncomeStatementReport = {
    revenue: {},
    expenses: {},
    net_income: 0,
  };

  for (const account of revenueAccounts) {
    let balance = 0;
    const normalSide = account.normal_side === "credit" ? 1 : -1;

    for (const entry of revenueJournalEntries) {
      if (entry.account_number === account.account_number) {
        balance += normalSide * (entry.credit_amount - entry.debit_amount);
      }
    }

    incomeStatement.revenue[account.account_number] = {
      name: account.account_name,
      balance,
    };
    incomeStatement.net_income += balance;
  }

  for (const account of expenseAccounts) {
    let balance = 0;
    const normalSide = account.normal_side === "debit" ? 1 : -1;

    for (const entry of expenseJournalEntries) {
      if (entry.account_number === account.account_number) {
        balance += normalSide * (entry.debit_amount - entry.credit_amount);
      }
    }

    incomeStatement.expenses[account.account_number] = {
      name: account.account_name,
      balance,
    };
    incomeStatement.net_income -= balance;
  }
  return incomeStatement;
};




export default generateIncomeStatementReport;
