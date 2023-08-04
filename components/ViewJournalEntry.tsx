import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

type JournalEntryRow = {
    id: number;
    account_name: string;
    account_number: string;
    debit_amount: number | null;
    credit_amount: number | null;
    desc: string;
    journal_entry: {
      status: string;
      rejected_reason: string;
    }
  };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  journalEntryId: number;
}

const columns: GridColDef[] = [
  {
    field: "account_name",
    headerName: "Account Name",
    width: 250,
  },
  {
    field: "account_number",
    headerName: "Account Number",
    width: 150,
  },
  {
    field: "debit_amount",
    headerName: "Debit",
    type: "number",
    width: 120,
  },
  {
    field: "credit_amount",
    headerName: "Credit",
    type: "number",
    width: 120,
  },
  {
    field: "desc",
    headerName: "Description",
    width: 250,
  },
];

const ViewJournalEntry = ({ isOpen, onClose, journalEntryId }: Props) => {
  const [rows, setRows] = useState<JournalEntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();
  const [rejectedEntry, setRejectedEntry] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {data, error} = await supabase.from(`journal_line_item`).select("*, journal_entry!inner(status, rejected_reason)").eq("journal_entry_id", journalEntryId);
        if(error){
            throw error;
        }
        console.log(data);
        if(data[0].journal_entry.status == "rejected"){
          setRejectedEntry(true);
        }
        setRows(data);
      } catch (error: any) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchData();
  }, [journalEntryId]);

  return (
    <Dialog fullScreen open={isOpen} onClose={onClose}>
      <DialogTitle >
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
        <Typography variant="h4">View Journal Entry {journalEntryId}</Typography>
        {rejectedEntry && <>
          <Typography variant="h5" color="red">Rejected. Reason: {rows[0].journal_entry.rejected_reason}</Typography>
        </>}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <div >
            <CircularProgress />
          </div>
        ) : (
          <div style={{ height: 500 }}>
            <DataGrid columns={columns} rows={rows} />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{paddingRight: "50px"}}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewJournalEntry;
