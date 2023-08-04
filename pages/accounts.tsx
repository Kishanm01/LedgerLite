"use client";

import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
  MuiEvent,
} from "@mui/x-data-grid";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  GetServerSidePropsContext,
  PreviewData,
  NextApiRequest,
  NextApiResponse,
  InferGetServerSidePropsType,
} from "next";
import { ParsedUrlQuery } from "querystring";
import React, { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormInputText } from "../components/formComponents/formInputText";
import { FormInputSelect } from "../components/formComponents/formInputSelect";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { useRouter } from "next/router";
import ViewLedger from "../components/ViewLedger";
import { Email } from "@mui/icons-material";
import SendEmail from "../components/SendEmail";
import { UserContext } from "../components/layouts/AuthLayout";
import AccountsChanges from "../components/AccountsChanges";

export const getServerSideProps = async (
  ctx:
    | GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
    | { req: NextApiRequest; res: NextApiResponse<any> }
) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx);
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: role, error } = await supabase
    .from(`profiles`)
    .select("role")
    .eq("id", session?.user?.id);

  if (!session)
    // If no session, then redirect user to login page.
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  return {
    props: {
      initialSession: session,
      user: session.user,
      //@ts-ignore
      role: role[0]?.role ?? "",
    },
  };
};

export default function Accounts(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [openAccountsModal, setOpenAccountsModal] = React.useState(false);
  // const [role, setRole] = React.useState<String>(props.role);
  const supabase = useSupabaseClient();

  const router = useRouter();
  const [selectedAccount, setSelectedAccount] = useState(router.query.account_id);
  const [accountSelected, setAccountSelected] = useState(false);
  const [openSendEmail, setOpenSendEmail] = useState(false);

  const {role, full_name, avatar_url, id} = useContext(UserContext);

  useEffect(() => {
    if(router.query.account_id){
      setSelectedAccount(router.query.account_id);
      setAccountSelected(true);
    }
  }, [router]);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  useEffect(() => {
    getAccounts();
  }, []);

  const getAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select(`*`)
        .eq("archived", false);
      setLoading(false);
      if (data) {
        data.forEach((row) => (row.id = row.id.toString()));
        setRows(data);
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const handleCreateAccount = () => {
    setOpenAccountsModal(true);
  };

  const handleSave: GridEventListener<"cellEditStop"> = (
    params,
    event,
    details
  ) => {
    console.log(params);
    console.log(event);
    console.log(details);
  };

  const handleRowEditStart = (
    params: GridRowParams,
    event: MuiEvent<React.SyntheticEvent>
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    console.log("hello");
    event.defaultMuiPrevented = true;
  };

  const handleEditClick = (id: GridRowId) => () => {
    console.log("hello");
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    console.log(`Saving: ${id}`);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (account_id: GridRowId) => async () => {
    if (confirm("Are you positive?")) {
      try {
        const res = await fetch(`/api/accounts?id=${account_id}&user_id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error);
        }
        setRows(rows.filter((row) => row.id !== id));
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    // console.log("doing row update");
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts?id=${newRow.id}&user_id=${id}`, {
        method: "PUT",
        body: JSON.stringify(newRow),
      });
      setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
      setLoading(false);
      return updatedRow;
    } catch (error: any) {
      alert(error.error_description || error.message);
      setLoading(false);
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    console.log("Row Modes model has changeed", newRowModesModel);
    setRowModesModel(newRowModesModel);
  };

  return (
    <>
    <Box sx={{display: "flex", flexDirection: 'row', marginLeft: "50px", marginTop: "50px", marginRight: "50px"}}>
    <Typography variant="h3" sx={{flexGrow: 4}}>Accounts </Typography>
    <Button variant="text" sx={{justifySelf: "flex-end"}} onClick={() => setOpenSendEmail(true)}>
      <Email />
      Send email</Button>

    </Box>
      <Box sx={{ height: "800px" }}>
        <DataGrid
          sx={{ marginRight: "50px", marginTop: "50px", marginLeft: "50px" }}
          loading={loading}
          rows={rows}
          columnVisibilityModel={{
            id: false,
            user_id: false,
          }}
          columns={[
            // Column def for the accounts table.
            //@ts-ignore
            role == "admin" && {
              field: "actions",
              type: "actions",
              headerName: "Actions",
              width: 100,
              cellClassName: "actions",
              getActions: ({ id }) => {
                const isInEditMode =
                  rowModesModel[id]?.mode === GridRowModes.Edit;
                if (isInEditMode) {
                  return [
                    <GridActionsCellItem
                      icon={<SaveIcon />}
                      label="Save"
                      onClick={handleSaveClick(id)}
                    />,
                    <GridActionsCellItem
                      icon={<CancelIcon />}
                      label="Cancel"
                      className="textPrimary"
                      onClick={handleCancelClick(id)}
                      color="inherit"
                    />,
                  ];
                }

                return [
                  <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    className="textPrimary"
                    onClick={handleEditClick(id)}
                    color="inherit"
                  />,
                  <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={handleDeleteClick(id)}
                    color="inherit"
                  />,
                ];
              },
            },
            {
              field: "id",
              width: 50,
              headerName: "ID",
              // hide: true,
            },
            {
              field: "user_id",
              width: 300,
              headerName: "Created By",
              // hide: true,
            },
            {
              field: "account_name",
              width: 200,
              headerName: "Account Name",
              editable: true,
              type: "text",
              renderCell: (params) => {
                return <Link href={`/accounts?account_id=${params.row.account_number}&account_name=${params.row.account_name}`} style={{color: "white"}}>{params.value}</Link>;
              },
            },
            {
              field: "account_number",
              width: 200,
              headerName: "Account Number",
            },
            {
              field: "account_desc",
              width: 200,
              headerName: "Description",
              editable: true,
            },
            {
              field: "account_category",
              width: 200,
              headerName: "Account Category",
              editable: true,
              type: "singleSelect",
              valueOptions: [
                "assets",
                "liabilities",
                "equity",
                "revenue",
                "expenses",
              ],
            },
            {
              field: "account_subcategory",
              width: 200,
              headerName: "Account Subcategory",
              editable: true,
            },
            {
              field: "initial_balance",
              width: 150,
              headerName: "Initial Balance",
              editable: true,
              type: "number",
              valueFormatter: ({ value }) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                }).format(value),
            },
            {
              field: "balance",
              width: 150,
              headerName: "Current Balance",
              editable: true,
              type: "number",
              valueFormatter: ({ value }) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                }).format(value),
            },
            {
              field: "normal_side",
              width: 200,
              headerName: "Normal Side",
              editable: true,
              type: "singleSelect",
              valueOptions: ["credit", "debit"],
            },
            {
              field: "statement",
              width: 200,
              headerName: "Statement",
              editable: true,
            },
            {
              field: "order",
              width: 200,
              headerName: "Order",
              editable: true,
              type: "number",
            },
          ]}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStart={handleRowEditStart}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{ toolbar: AccountsToolBar }}
          slotProps={{
            toolbar: { onCreateAccount: handleCreateAccount, role: props.role },
          }}
        />
      </Box>
      {openAccountsModal && <AccountModal
        open={openAccountsModal}
        onClose={() => setOpenAccountsModal(false)}
        uid={props.user.id}
        getRows={() => getAccounts()}
      />}

      {accountSelected && <ViewLedger open={accountSelected} handleClose={() => {
        setAccountSelected(false)
        router.back();
      }
      
    }/>}
    {openSendEmail && <SendEmail open={openSendEmail} handleClose={() => setOpenSendEmail(false)} />}
    <AccountsChanges /> 
    </>
  );
}

const AccountsToolBar = (props: {
  onCreateAccount: () => void;
  role: string;
}) => {
  const { onCreateAccount, role } = props;
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />

      {role == "admin" && (
        <Button variant="outlined" onClick={onCreateAccount}>
          Create Account
        </Button>
      )}
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
};

type AccountFormType = {
  account_name: string;
  account_number: number;
  account_desc: string;
  normal_side: "credit" | "debit";
  account_category: string;
  account_subcategory: string;
  intial_balance: number;
  order: string;
  statement: string;
  comment: string;
};

const AccountModal = (props: {
  open: boolean;
  onClose: () => void;
  uid: string;
  getRows: () => void;
}) => {
  const methods = useForm<AccountFormType>();
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { isDirty },
  } = methods;
// React hook form for creating new account.
  const { onClose, open, uid, getRows } = props;

  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    try {
      // Api call to create a new account.
      const res = await fetch(`/api/accounts?user_id=${uid}`, {
        method: "POST",
        body: JSON.stringify({ ...data, user_id: uid }),
      });
      // if(res.ok){
      if (res.ok) {
        setLoading(false);
        getRows();
        handleClose("e", "Saved Data");
      } else {
        const errorMessage = await res.json();
        alert(errorMessage.error);
        // console.log(await res.text());
      }
    } catch (error: any) {
      setLoading(false);
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  });

  const handleClose = (_: any, reason: any) => {
    if (reason && reason == "backdropClick") return;
    reset();
    onClose();
  };
  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <Backdrop sx={{ color: "#fff" }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <DialogTitle>Create Account</DialogTitle>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <FormInputText
          control={control}
          name="account_name"
          label="Account Name"
          rules={{
            required: { value: true, message: "Please enter an account name" },
          }}
          type="text"
          sx={{ width: "80%" }}
        />

        <FormInputText
          control={control}
          name="account_number"
          label="Account Number"
          rules={{
            required: {
              value: true,
              message: "Please enter an account number",
            },
          }}
          type="number"
          sx={{ width: "80%" }}
        />

        <FormInputText
          control={control}
          name="account_desc"
          label="Account Description"
          rules={{
            required: {
              value: true,
              message: "Please enter an account description",
            },
          }}
          type="text"
          minRows={3}
          sx={{ width: "80%" }}
        />

        <FormLabel
          id="Normal Side"
          sx={{
            textAlign: "left",
            alignSelf: "flex-start",
            paddingLeft: "60px",
          }}
        >
          Normal Side:
        </FormLabel>
        <Controller
          name="normal_side"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <RadioGroup
              aria-labelledby="Normal side"
              sx={{
                paddingBottom: "30px",
                alignSelf: "flex-start",
                paddingLeft: "60px",
                flexDirection: "row",
              }}
              {...field}
            >
              <FormControlLabel
                value="credit"
                control={<Radio />}
                label="Credit"
              />
              <FormControlLabel
                value="debit"
                control={<Radio />}
                label="Debit"
              />
            </RadioGroup>
          )}
        />

        <FormInputSelect
          control={control}
          name="account_category"
          label="Account Category"
          sx={{ width: "80%", paddingBottom: "20px" }}
        >
          <MenuItem value="assets">Assets</MenuItem>
          <MenuItem value="liabilities">Liabilites</MenuItem>
          <MenuItem value="equity">Equity</MenuItem>
          <MenuItem value="revenue">Revenue</MenuItem>
          <MenuItem value="expenses">Expenses</MenuItem>
        </FormInputSelect>

        <FormInputText
          control={control}
          name="account_subcategory"
          label="Account Sub Category"
          rules={{
            required: {
              value: true,
              message: "Please enter an account subcategory",
            },
          }}
          type="text"
          sx={{ width: "80%" }}
        />

        <FormInputText
          control={control}
          name="initial_balance"
          label="Initial Balance"
          rules={{
            required: {
              value: true,
              message: "Please enter an initial balance",
            },
          }}
          type="number"
          sx={{ width: "80%" }}
        />
        <FormInputText
          control={control}
          name="order"
          label="Order"
          rules={{
            required: {
              value: true,
              message: "Please enter an order",
            },
          }}
          type="number"
          sx={{ width: "80%" }}
        />

        <FormInputText
          control={control}
          name="statement"
          label="Statement"
          rules={{
            required: {
              value: true,
              message: "Please enter an Statement",
            },
          }}
          type="text"
          sx={{ width: "80%" }}
        />

        <FormInputText
          control={control}
          name="comment"
          label="Comment"
          rules={{
            required: {
              value: true,
              message: "Please enter a comment",
            },
          }}
          type="text"
          sx={{ width: "80%" }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignSelf: "flex-end",
            paddingRight: "60px",
            paddingBottom: "30px",
          }}
        >
          <Button
            variant="outlined"
            sx={{ marginRight: "20px" }}
            onClick={() => handleClose("test", "cancel")}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={onSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
