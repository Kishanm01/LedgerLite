import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Modal,
  Toolbar,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Close } from "@mui/icons-material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Link from "next/link";

interface ViewLedgerProps {
  open: boolean;
  handleClose: () => void;
}
function ViewLedger({ open, handleClose }: ViewLedgerProps) {
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();

  const router = useRouter();

  const [accountInfo, setAccountInfo] = useState({
    id: router.query.account_id,
    name: router.query.account_name,
  });

  useEffect(() => {
    getLedgerData();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "entry_date",
      headerName: "Date",
      flex: 1,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      field: "journal_entry_id",
      headerName: "Journal Entry",
      flex: 2,
      renderCell: (params) => {
        return (
          <Link
            href={`/journal?journal_entry_id=${params.row.journal_entry_id}`}
            style={{ color: "white" }}
          >
            {params.value}
          </Link>
        );
      },
    },
    { field: "debit_amount", headerName: "Debit", flex: 1,  type: "number",
    valueFormatter: ({ value }) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(value) },
    { field: "credit_amount", headerName: "Credit", flex: 1,  type: "number",
    valueFormatter: ({ value }) => {
      
      console.log(value);
        if(value == null){
          return "";
      }else{
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        }).format(value)}
      }},
    {
      field: "balance",
      headerName: "Balance",
      type: "number",
      valueFormatter: ({ value }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        }).format(value)
    },
    { field: "desc", headerName: "Description", flex: 2 },
  ];

  const getLedgerData = async () => {
    try {
      const { data, error } = await supabase
        .from(`journal_line_item`)
        .select("*, journal_entry!inner(status)")
        .eq("account_number", accountInfo.id)
        .eq("journal_entry.status", "approved")
        .order("entry_date", { ascending: true });

        console.log(data);

      const { data: AccountData, error: AccountError } = await supabase
        .from("accounts")
        .select("*")
        .eq("account_number", accountInfo.id);
      console.log(data);
      if (error || AccountError) {
        throw new Error("Error getting your data");
      }

      let balance = AccountData[0].initial_balance || 0;
      const normalSide = AccountData[0].normal_side === "debit" ? 1 : -1;
      const ledgerDataWithBalance = data.map((row) => {
        const debitAmount = normalSide * row.debit_amount;
        const creditAmount = normalSide * row.credit_amount;
        balance += debitAmount - creditAmount;
        return {
          ...row,
          balance,
        };
      });
      setLedgerData(ledgerDataWithBalance);
      setLoading(false);
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
      <DialogTitle sx={{ display: "flex", flexDirection: "row" }}>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
        <Typography variant="h3">View Ledger for {accountInfo.name}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <div>
            <CircularProgress />
          </div>
        ) : (
          <div style={{ height: 500 }}>
            <DataGrid
              columns={columns}
              rows={ledgerData}
              slots={{ toolbar: GridToolbar }}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ paddingRight: "50px" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewLedger;
