import { Add, Close, FileUpload, Restore, Save } from "@mui/icons-material";
import {
  Dialog,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Icon,
  Checkbox,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowParams,
  MuiEvent,
  useGridApiRef,
} from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useMemo, useState } from "react";

type JournalEntryRow = {
  id: number;
  account_name: string;
  account_number: string;
  debit: number | null;
  credit: number | null;
  desc: string;
  error?: boolean; // optional error property
};

export const JournalEntryDialog = (props: {
  openDialog: boolean;
  handleCloseDialog: () => void;
  journalEntryNumber: number;
}) => {
  const { openDialog, handleCloseDialog, journalEntryNumber } = props;
  const [accounts, setAccounts] =
    useState<{ account_number: string; account_name: string }[]>();
  const supabase = useSupabaseClient();

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const apiRef = useGridApiRef();

  const [saveClicked, setSavedClicked] = useState(false);

  const [entryDate, setEntryDate] = useState<Dayjs | null>(dayjs());

  const [minDate, setMinDate] = useState(dayjs().startOf("month"));
  
  const [maxDate, setMaxDate] = useState(dayjs().endOf("day"));

  const [adjustingEntry, setAdjustingEntry] = useState(false);

  const [errorText, setErrorText] = useState<string | null>();

  useEffect(() => {
    if (adjustingEntry) {
      setMinDate(dayjs().subtract(1, "year"));
      setMaxDate(dayjs().subtract(1, "month").endOf("month"));
    } else {
      setMinDate(dayjs().startOf("month"));
      setMaxDate(dayjs().endOf("day"));
    }
  }, [adjustingEntry]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const [rows, setRows] = useState<JournalEntryRow[]>([
    {
      id: 1,
      account_name: "",
      account_number: "",
      debit: null,
      credit: null,
      desc: "",
    },
    {
      id: 2,
      account_name: "",
      account_number: "",
      debit: null,
      credit: null,
      desc: "",
    },
    {
      id: 3,
      account_name: "",
      account_number: "",
      debit: null,
      credit: null,
      desc: "",
    },
    {
      id: 4,
      account_name: "",
      account_number: "",
      debit: null,
      credit: null,
      desc: "",
    },
    {
      id: 5,
      account_name: "",
      account_number: "",
      debit: null,
      credit: null,
      desc: "",
    },
    {
      id: 6,
      account_name: "",
      account_number: "",
      debit: null,
      credit: null,
      desc: "",
    },
  ]);

  useEffect(() => {
    if (saveClicked) {
      handleSave();
    }
  }, [saveClicked]);

  const getAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from(`accounts`)
        .select("account_number, account_name")
        .eq("archived", false);
      if (error) {
        throw error;
      }
      setAccounts(data);
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  useEffect(() => {
    console.log("Getting called");
  }, [rows]);

  useEffect(() => {
    getAccounts();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "#",
      width: 30,
      type: "number",
      sortable: false,
    },
    {
      field: "account_name",
      headerName: "Account Name",
      width: 250,
      editable: true,
      type: "singleSelect",
      valueOptions: accounts
        ? accounts.map((account) => account.account_name)
        : [""],
      valueFormatter: (params) => {
        const accountName = params.value;
        return accountName;
      },
      sortable: false,
    },
    {
      field: "debit",
      headerName: "Debit",
      width: 120,
      editable: true,
      type: "number",
      sortable: false,
      valueFormatter: ({ value }) =>
        value
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
            }).format(value)
          : "",
    },
    {
      field: "credit",
      headerName: "Credit",
      width: 120,
      editable: true,
      type: "number",
      sortable: false,
      valueFormatter: ({ value }) =>
        value
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
            }).format(value)
          : "",
    },
    {
      field: "desc",
      headerName: "Description",
      width: 250,
      editable: true,
      sortable: false,
    },
    {
      field: "account_number",
      headerName: "Account Number",
      sortable: false,
      width: 300,
    },
  ];

  const processRowUpdate = (newRow: GridRowModel) => {
    const account = accounts?.find(
      (account) => account.account_name === newRow.account_name
    );
    if (account && account.account_number !== newRow.account_number) {
      newRow = { ...newRow, account_number: account.account_number };
    }
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === newRow.id) {
          return { ...row, ...newRow };
        }
        return row;
      })
    );

    const updatedRow = { ...newRow };
    return updatedRow;
  };

  const handleReset = () => {
    setRows([
      {
        id: 1,
        account_name: "",
        account_number: "",
        debit: null,
        credit: null,
        desc: "",
      },
      {
        id: 2,
        account_name: "",
        account_number: "",
        debit: null,
        credit: null,
        desc: "",
      },
      {
        id: 3,
        account_name: "",
        account_number: "",
        debit: null,
        credit: null,
        desc: "",
      },
      {
        id: 4,
        account_name: "",
        account_number: "",
        debit: null,
        credit: null,
        desc: "",
      },
      {
        id: 5,
        account_name: "",
        account_number: "",
        debit: null,
        credit: null,
        desc: "",
      },
      {
        id: 6,
        account_name: "",
        account_number: "",
        debit: null,
        credit: null,
        desc: "",
      },
    ]);
  };
  const handleSave = async () => {
    const invalidRows = rows.filter((row) => {
      const isDebitNullOrNegative = row.debit === null || row.debit < 0;
      const isCreditNullOrNegative = row.credit === null || row.credit < 0;
      return (
        !(
          row.account_name.trim() === "" &&
          row.debit === null &&
          row.credit === null &&
          row.desc.trim() === ""
        ) &&
        (row.account_name.trim() === "" ||
          (isDebitNullOrNegative && isCreditNullOrNegative) ||
          (row.debit !== null && isDebitNullOrNegative) ||
          (row.credit !== null && isCreditNullOrNegative))
      );
    });

    const emptyRows = rows.filter((row) => {
      return (
        row.account_name.trim() === "" &&
        row.debit === null &&
        row.credit === null &&
        row.desc.trim() === ""
      );
    });

    if (emptyRows.length < rows.length && invalidRows.length > 0) {
      setRows(
        rows.map((row) => {
          if (invalidRows.includes(row)) {
            return { ...row, error: true };
          } else {
            const { error, ...cleanRow } = row;
            return cleanRow;
          }
        })
      );
      // alert(
        // `Please fill in all required fields for rows ${invalidRows
        //   .map((row) => row.id)
        //   .join(", ")}`
      // );

      setErrorText( `Please fill in all required fields for rows ${invalidRows
        .map((row) => row.id)
        .join(", ")}`);
      return;
    }

    // Check that no row has both a debit and a credit but not both.
    const rowsWithDebitAndCredit = rows.filter(
      (row) => row.debit !== null && row.credit !== null
    );
    if (rowsWithDebitAndCredit.length > 0) {
      setErrorText(
        `Row(s) ${rowsWithDebitAndCredit
          .map((row) => row.id)
          .join(", ")} have both a debit and a credit.`
      );
      return;
    }

    // Check that debit and credit amounts are positive
    const invalidAmountRows = rows.filter(
      //@ts-ignore
      (row) => row.debit < 0 || row.credit < 0
    );
    if (invalidAmountRows.length > 0) {
      setErrorText(
        `Debit and credit amounts must be positive for rows ${invalidAmountRows
          .map((row) => row.id)
          .join(", ")}`
      );
      return;
    }

    // Check that credits and debits equal each other
    const totalDebit = rows.reduce((acc, row) => acc + (row.debit || 0), 0);
    const totalCredit = rows.reduce((acc, row) => acc + (row.credit || 0), 0);
    if (totalDebit !== totalCredit) {
      setErrorText(
        `Debits and credits do not balance. Total debits: ${totalDebit}, total credits: ${totalCredit}.`
      );
      return;
    }

    // Other common sense accounting error handling can be done here
    setErrorText(null);
    // If all checks pass, proceed with submitting to backend
    try {
      // Submit to backend and handle success
      const { data, error } = await supabase.auth.getUser();
      const formData = new FormData();
      //@ts-ignore
      formData.append("file", selectedFile);
      formData.append("rows", JSON.stringify(rows));
      formData.append("user", data?.user?.id ?? "");
      formData.append("type", adjustingEntry ? "adjusting" : "regular");
      formData.append("entry_date", entryDate != null ? entryDate.toString() : "");
      console.log(rows);
      const res = await fetch(`/api/journalEntry`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok)
        throw new Error("There was an error submitting your journal entry.");
      handleCloseDialog();
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const handleAddRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      {
        id: prevRows[prevRows.length - 1].id + 1,
        account_name: "",
        account_number: "",
        debit: null,
        credit: null,
        desc: "",
      },
    ]);
  };

  return (
    <Dialog open={openDialog} fullScreen onClose={handleCloseDialog}>
      <Toolbar>
        <IconButton edge="start" onClick={handleCloseDialog}>
          <Close />
        </IconButton>
      </Toolbar>
      <Box sx={{ display: "flex", flexDirection: "row", marginBottom: "20px", alignItems: "center" }}>
        <Typography variant="h4" sx={{ paddingLeft: "30px" }}>
          Journal Entry #{journalEntryNumber}
        </Typography>
        <DatePicker
          sx={{ marginLeft: "20px" }}
          value={entryDate}
          onChange={(val) => setEntryDate(val)}
          minDate={minDate}
          maxDate={maxDate}
          
        />

        <Typography sx={{paddingLeft: "30px"}}>
          Adjusting Journal Entry
        </Typography>
        <Checkbox checked={adjustingEntry} onChange={() => setAdjustingEntry(!adjustingEntry)}/>

        {errorText !=  null ? <Typography color={"error"}>Error: {errorText}</Typography> : null}
      </Box>
      <DataGrid
        sx={{
          "& .MuiDataGrid-row.error-row": {
            border: "1px solid red",
          },
        }}
        getRowClassName={(params) => {
          return params.row.error ? "error-row" : "";
        }}
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        
        editMode="cell"
        rowModesModel={rowModesModel}
        disableColumnFilter
        disableColumnMenu
        processRowUpdate={processRowUpdate}
        slots={{
          footer: CustomFooter,
        }}
        slotProps={{
          footer: {
            //@ts-ignore
            handleReset,
            handleSave,
            handleAddRow,
            handleFileChange,
            selectedFile,
            setSavedClicked,
            rows,
            setRowModesModel,
          },
        }}
      />
    </Dialog>
  );
};

const CustomFooter = (props: {
  handleReset: () => void;
  handleSave: () => void;
  handleAddRow: () => void;
  handleFileChange: () => void;
  selectedFile: File | null;
  setSavedClicked: React.Dispatch<React.SetStateAction<boolean>>;
  rows: JournalEntryRow[];
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
}) => {
  const {
    handleReset,
    handleSave,
    handleAddRow,
    handleFileChange,
    selectedFile,
  } = props;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
      }}
    >
      <Button
        sx={{ display: "flex", alignItems: "center" }}
        onClick={handleReset}
        color="warning"
      >
        <Restore />
        <Typography sx={{ marginLeft: "8px" }}>Reset</Typography>
      </Button>
      <Button variant="contained" onClick={handleAddRow}>
        <Add />
        Add Row
      </Button>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
        }}
      >
        <Button variant="outlined" component="label">
          <input hidden accept="*" type="file" onChange={handleFileChange} />
          <FileUpload />
          Attach File
        </Button>
        {selectedFile && (
          <Typography sx={{ paddingLeft: "15px" }}>
            {selectedFile.name}
          </Typography>
        )}
      </Box>
      <Button
        sx={{ display: "flex", alignItems: "center" }}
        onClick={() => {
          handleSave();
        }}
        variant="contained"
      >
        <Save />
        <Typography sx={{ marginLeft: "8px" }}>Save</Typography>
      </Button>
    </Box>
  );
};
