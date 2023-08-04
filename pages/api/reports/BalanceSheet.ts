import { SupabaseClient } from "@supabase/supabase-js";
import { BalanceSheetReport } from ".";
import generatePDFDocument from "./BalanceSheetPDF";


const generateBalanceSheetReport = async (
    supabase: SupabaseClient<any, "public", any>,
    dateRange: { start: string; end: string }
  ) => {
    // get all account categories.
    const { data: assets, error: assetsError } = await supabase
      .from("accounts")
      .select("*")
      .eq("account_category", "assets");
  
    const { data: liabilities, error: liabilitiesError } = await supabase
      .from("accounts")
      .select("*")
      .eq("account_category", "liabilities");
  
    const { data: equity, error: equityError } = await supabase
      .from("accounts")
      .select("*")
      .eq("account_category", "equity");
  
    // If error throw error
    if (assetsError || liabilitiesError || equityError) {
      console.error(assetsError || liabilitiesError || equityError);
      throw new Error("Could not fetch accounts");
    }
  
    // Select the journa entries for each individual type of account.
    const { data: assetsJournalEntries, error: assetsJournalEntriesError } =
      await supabase
        .from("journal_line_item")
        .select("*, journal_entry!inner(status)")
        .eq("journal_entry.status", "approved")
        .in(
          "account_number",
          assets.map((account) => account.account_number)
        )
        .gte("entry_date", dateRange.start)
        .lte("entry_date", dateRange.end);
  
    const {
      data: liabilitiesJournalEntries,
      error: liabilitiesJournalEntriesError,
    } = await supabase
      .from("journal_line_item")
      .select("*, journal_entry!inner(status)")
      .eq("journal_entry.status", "approved")
      .in(
        "account_number",
        liabilities.map((account) => account.id)
      )
      .gte("entry_date", dateRange.start)
      .lte("entry_date", dateRange.end);
  
    const { data: equityJournalEntries, error: equityJournalEntriesError } =
      await supabase
        .from("journal_line_item")
        .select("*, journal_entry!inner(status)")
        .eq("journal_entry.status", "approved")
        .in(
          "account_number",
          equity.map((account) => account.id)
        )
        .gte("entry_date", dateRange.start)
        .lte("entry_date", dateRange.end);
  
    if (
      assetsJournalEntriesError ||
      liabilitiesJournalEntriesError ||
      equityJournalEntriesError
    ) {
      throw new Error("Could not fetch journal entries");
    }
  
    //initialize empty balance sheet
    const balanceSheet: BalanceSheetReport = {
      assets: {},
      liabilities: {},
      equity: {},
      total_assets: 0,
      total_liabilities: 0,
      total_equity: 0,
    };
  
    // Loop through each asset account, applying debits and credits where needed.
    for (const account of assets) {
      let balance = account.initial_balance;
      // Account for the normal side of that account.
      const normalSide = account.normal_side === "debit" ? 1 : -1;
  
      for (const entry of assetsJournalEntries) {
        if (entry.account_number === account.account_number) {
          balance += normalSide * (entry.debit_amount - entry.credit_amount);
        }
      }
      balanceSheet.assets[account.id] = {
        name: account.account_name,
        balance,
      };
  
      balanceSheet.total_assets += balance;
    }
  
    for (const account of liabilities) {
      let balance = account.initial_balance;
      const normalSide = account.normal_side === "credit" ? 1 : -1;
  
      for (const entry of liabilitiesJournalEntries) {
        if (entry.account_number === account.account_number) {
          balance += normalSide * (entry.credit_amount - entry.debit_amount);
        }
      }
  
      balanceSheet.liabilities[account.account_number] = {
        name: account.account_name,
        balance,
      };
      balanceSheet.total_liabilities += balance;
    }
  
    for (const account of equity) {
      let balance = account.initial_balance;
      const normalSide = account.normal_side === "credit" ? 1 : -1;
  
      for (const entry of equityJournalEntries) {
        if (entry.account_number === account.account_number) {
          balance += normalSide * (entry.credit_amount - entry.debit_amount);
        }
      }
  
      balanceSheet.equity[account.account_number] = {
        name: account.account_name,
        balance,
      };
      balanceSheet.total_equity += balance;
    }
  
    return balanceSheet;
  
  };

  export default generateBalanceSheetReport;