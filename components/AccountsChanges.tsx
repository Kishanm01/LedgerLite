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
  Box,
  Avatar,
} from "@mui/material";
import { Close, Visibility } from "@mui/icons-material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridToolbar,
} from "@mui/x-data-grid";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import ReactDiffViewer from "react-diff-viewer-continued";

type AccountsChanges = {
  id: number;
  action: string;
  changed_at: string;
  old_data: {};
  new_data: {};
  account_id: string;
  account_number: string;
  modified_by: {
    avatar_url: string;
    full_name: string;
  };
  approved_by: {
    full_name: string;
    avatar_url: string;
  }
};

const AccountsChanges = () => {
  const [rows, setRows] = useState<AccountsChanges[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();
  const [oldData, setOldData] = useState();
  const [newData, setNewData] = useState();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from(`accounts_changes`)
          .select("*, modified_by:modified_by(full_name, avatar_url), approved_by:approved_by(full_name, avatar_url)").order("changed_at", {ascending: false});
          console.log(data);
          if(data !== null){
              setRows(data);
          }
      } catch (error: any) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

//@ts-ignore
  const handleOpenViewChanges = (oldData, newData) => {
    setOldData({ ...oldData });
    setNewData({ ...newData });
    setIsOpen(true);
  };
  const columns: GridColDef[] = [
    {
      field: "action",
      headerName: "Action",
      width: 250,
    },
    {
      field: "account_number",
      headerName: "Account Number",
      width: 150,
    },
    {
      field: "changed_at",
      headerName: "Time Changed",
      width: 250,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const time = date.toLocaleTimeString();
        return `${month}-${day} ${time}`;
      },
    },
    {
      field: "changes",
      width: 150,
      type: "actions",
      headerName: "View Changes",
      getActions: (params) => {
        return [
          <GridActionsCellItem
            icon={<Visibility />}
            label="View"
            onClick={() =>
              handleOpenViewChanges(params.row.old_data, params.row.new_data)
            }
          />,
        ];
      },
    },
    {
        field: "modified_by",
        headerName: "Modified By",
        width: 200,
        valueGetter: (params) => params.row.modified_by?.full_name,
        renderCell: (params) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar src={params.row.modified_by?.avatar_url ?? undefined} alt={params.row.modified_by?.full_name}>
              {params.row.modified_by?.full_name?.charAt(0) ?? '?'}
            </Avatar>
            <span style={{ marginLeft: "8px" }}>{params.row.modified_by?.full_name ?? 'N/A'}</span>
          </div>
        ),
      },
      {
        field: "approved_by",
        headerName: "Approved By",
        width: 200,
        valueGetter: (params) => params.row.approved_by?.full_name,
        renderCell: (params) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar src={params.row.approved_by?.avatar_url ?? undefined} alt={params.row.approved_by?.full_name}>
              {params.row.approved_by?.full_name?.charAt(0) ?? '?'}
            </Avatar>
            <span style={{ marginLeft: "8px" }}>{params.row.approved_by?.full_name ?? 'N/A'}</span>
          </div>
        ),
      },
  ];
  return (
    <Box
      sx={{
        height: "800px",
        marginLeft: "50px",
        marginTop: "50px",
        marginRight: "50px",
      }}
    >
      <Typography variant="h4">View Changes to Accounts</Typography>
      <DataGrid columns={columns} rows={rows} slots={{toolbar: GridToolbar}}/>
      {isOpen && (
        <ChangesDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          oldData={oldData}
          newData={newData}
        />
      )}
    </Box>
  );
};

const CurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

interface ChangesDialogTypes {
    isOpen: boolean;
    onClose: () => void;
    oldData: any;
    newData: any;
}

const ChangesDialog = ({ isOpen, onClose, oldData, newData }: ChangesDialogTypes) => {
  // console.log(newData);
  const formatJson = (json: any) => {
    const currencyFields = ["initial_balance", "balance"];
    //@ts-ignore
    const replacer = (key, value) => {
      return currencyFields.includes(key)
        ? CurrencyFormatter.format(value)
        : value;
    };
    return JSON.stringify(json, replacer, 2).replace(/\r\n|\r|\n/g, "\n");
  };

  return (
    <Dialog fullScreen open={isOpen} onClose={onClose}>
      <DialogContent>
        <ReactDiffViewer
          oldValue={formatJson(oldData)}
          newValue={formatJson(newData)}
          splitView={true}
          showDiffOnly={false}
          useDarkTheme={true}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ paddingRight: "50px" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountsChanges;
