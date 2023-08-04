import { SupabaseClient } from "@supabase/supabase-js";

export type TrialBalanceReport = {
    accounts: {
      [accountNumber: string]: {
        name: string;
        balance: number;
        normal_side: string;
      };
    };
    total_debit: number;
    total_credit: number;
  };

const generateTrialBalance = async (
  supabase: SupabaseClient<any, "public", any>,
  dateRange: { start: string; end: string }
) => {
  // get all accounts
  const { data: accounts, error } = await supabase.from("accounts").select("*");

  // If error throw error
  if (error) {
    console.error(error);
    throw new Error("Could not fetch accounts");
  }

  // Select the journal entries for each individual account.
  const { data: journalEntries, error: journalEntriesError } = await supabase
    .from("journal_line_item")
    .select("*, journal_entry!inner(status)")
    .eq("journal_entry.status", "approved")
    .in(
      "account_number",
      accounts.map((account) => account.account_number)
    )
    .gte("entry_date", dateRange.start)
    .lte("entry_date", dateRange.end);

  if (journalEntriesError) {
    console.error(journalEntriesError);
    throw new Error("Could not fetch journal entries");
  }

  // Initialize empty trial balance
  const trialBalance: TrialBalanceReport = {
    accounts: {},
    total_debit: 0,
    total_credit: 0,
  };

  // Loop through each account, applying debits and credits where needed
  for (const account of accounts) {
    let balance = account.initial_balance;
    let normalSide = account.normal_side === "debit" ? 1 : -1;

    for (const entry of journalEntries) {
      if (entry.account_number === account.account_number) {
        balance += normalSide * (entry.debit_amount - entry.credit_amount);
      }
    }

    trialBalance.accounts[account.account_number] = {
      name: account.account_name,
      balance,
      normal_side: account.normal_side,
    };

    if (account.normal_side === "debit") {
      trialBalance.total_debit += balance;
    } else {
      trialBalance.total_credit += balance;
    }
  }

  return trialBalance;
};

export default generateTrialBalance;
