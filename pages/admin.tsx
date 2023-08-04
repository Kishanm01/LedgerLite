import {
  Box,
  Typography,
  IconButton,
  Button,
  Modal,
  Dialog,
  DialogTitle,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridEventListener,
  GridRenderCellParams,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowParams,
  GridToolbarContainer,
  MuiEvent,
} from "@mui/x-data-grid";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  GetServerSidePropsContext,
  PreviewData,
  NextApiRequest,
  NextApiResponse,
} from "next";
import Head from "next/head";
import { ParsedUrlQuery } from "querystring";
import React, { useEffect, useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";

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
    },
  };
};

export default function Admin() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [createUserLoading, setCreateUserLoading] = useState(false);

  const [currentUsers, setCurrentUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<{}[]>([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    // Gets all users from the profiles table.
    try {
      let { data: profiles, error: profileError } = await supabase
        .from(`profiles`)
        .select("*");
      let { data: userRequests, error } = await supabase
        .from(`userRequests`)
        .select("*");
      if (profiles != null && userRequests != null) {
        setCurrentUsers(profiles);
        setRequests(userRequests);
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (params: GridRenderCellParams) => {
    setLoading(true);
    const reqBody = {
      password: params.row.password ?? "",
      email: params.row.email ?? "",
      id: params.row.id ?? "",
      metadata: {
        first_name: params.row.firstName ?? "",
        last_name: params.row.lastName ?? "",
        address: params.row.address ?? "",
        role: "regular",
        email: params.row.email ?? "",
      },
    };
    // The API call to create a new user. 
    try {
      const res = await fetch("/api/createNewUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...reqBody }),
      });
      alert("Succesfully created user");
      getUsers();
    } catch (error: any) {
      setLoading(false);
      alert(error.error_description || error.message);
    }
  };

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const handleDeny = (params: GridRenderCellParams) => {};

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

  const handleDeleteClick = (id: GridRowId) => async () => {
    if (confirm("Are you positive?")) {
      // try {
      //   const res = await fetch(`/api/accounts?id=${id}`, {
      //     method: "DELETE",
      //   });
      //   if (!res.ok) {
      //     const error = await res.json();
      //     throw new Error(error.error);
      //   }
      //   setCurrentUsers(currentUsers.filter((row) => row.id !== id));
      // } catch (error: any) {
      //   alert(error.message);
      // }
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = currentUsers.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setCurrentUsers(currentUsers.filter((row) => row.id !== id));
    }
  };

  // Updating the row of data after you leave editing state, just some weird MUI stuff
  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    // console.log("doing row update");
    setLoading(true);
    try {
      const res = await fetch(`/api/users?id=${newRow.id}`, {
        method: "PUT",
        body: JSON.stringify(newRow),
      });
      setCurrentUsers(
        currentUsers.map((row) => (row.id === newRow.id ? updatedRow : row))
      );
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
      <Head>
        <title>Administration</title>
      </Head>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h4">Current Users:</Typography>
        <Box sx={{ height: "500px", padding: "50px" }}>
          <DataGrid
            loading={loading}
            rows={currentUsers}
            components={{
              Toolbar: CustomToolBar,
            }}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStart={handleRowEditStart}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            columns={[
              {
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
                field: "first_name",
                width: 200,
                headerName: "First Name",
              },
              {
                field: "last_name",
                width: 200,
                headerName: "Last Name",
              },
              {
                field: "email",
                width: 200,
                headerName: "Email",
              },
              {
                field: "role",
                width: 200,
                headerName: "Role",
                editable: true,
                type: "singleSelect",
                valueOptions: [
                  "regular",
                  "manager",
                  "admin",
                ],
              },
            ]}
          />
        </Box>
        <Typography variant="h4">Requests</Typography>
        <Box sx={{ height: "500px", padding: "50px", alignItems: "center" }}>
          <DataGrid
            loading={loading}
            rows={requests}
            columns={[
              {
                field: "firstName",
                width: 200,
                headerName: "First Name",
              },
              {
                field: "lastName",
                width: 200,
                headerName: "Last Name",
              },
              {
                field: "email",
                width: 200,
                headerName: "Email",
              },
              {
                field: "address",
                width: 200,
                headerName: "Address",
              },
              {
                field: "dob",
                width: 200,
                headerName: "Date Of Birth",
              },
              {
                field: "approveButton",
                headerName: "Status",
                renderCell: (params: GridRenderCellParams) => {
                  return (
                    <>
                      <IconButton
                        sx={{ color: "green" }}
                        onClick={() => handleApprove(params)}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        sx={{ color: "red" }}
                        onClick={() => handleDeny(params)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  );
                },
              },
            ]}
            // pageSize={5}
            // rowsPerPageOptions={[5]}
            disableColumnSelector={true}
            // disableSelectionOnClick={true}
          />
        </Box>
      </Box>
    </>
  );
}

function CustomToolBar() {
  // Form for creating an account: First name, last name, email, role
  const [openModal, setOpenModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  const handleClick = () => {
    // try {
    //   fetch("/api/createNewUser", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });
    // } catch (error) {
    //   alert(error.error_description || error.message);
    // }
    setOpenModal(true);
  };

  const handleCreateNewUser = async () => {
    console.log(formData);
  };

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCloseModal = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "",
    });
    setOpenModal(false);
  };

  return (
    <GridToolbarContainer
      sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}
    >
      <Button variant="outlined" onClick={handleClick}>
        Create New User
      </Button>
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Create New User</DialogTitle>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            mr: 20,
            ml: 20,
            justifyContent: "center",
            height: "40vh",
          }}
        >
          <TextField
            variant="outlined"
            name="firstName"
            label="First Name"
            type="text"
            value={formData.firstName}
            onChange={(event) =>
              updateFormData("firstName", event.target.value)
            }
          />
          <TextField
            variant="outlined"
            name="lastName"
            label="Last Name"
            type="text"
            value={formData.lastName}
            onChange={(event) => updateFormData("lastName", event.target.value)}
          />

          <TextField
            variant="outlined"
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(event) => updateFormData("email", event.target.value)}
          />

          <InputLabel>Role</InputLabel>
          <Select
            id="role"
            value={formData.role}
            label="role"
            onChange={(event, _) => updateFormData("role", event.target.value)}
          >
            <MenuItem value="regular">Regular</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="admin">Administrator</MenuItem>
          </Select>
          <Button variant="contained">Submit</Button>
        </Box>
      </Dialog>
    </GridToolbarContainer>
  );
}
