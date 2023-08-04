import React, { useContext, useEffect, useState } from "react";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
  GetServerSidePropsContext,
  PreviewData,
  NextApiRequest,
  NextApiResponse,
  InferGetServerSidePropsType,
} from "next";
import { ParsedUrlQuery } from "querystring";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  Box,
  Button,
  Chip,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowModesModel,
  GridRowsProp,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import {
  Download,
  ThumbDown,
  ThumbUp,
  Visibility,
} from "@mui/icons-material";
import { JournalEntryDialog } from "../components/JournalEntryDialog";
import ViewJournalEntry from "../components/ViewJournalEntry";
import { UserContext } from "../components/layouts/AuthLayout";
import { useRouter } from "next/router";
import RejectJournalEntryDialog from "../components/RejectJournalEntry";

interface EditToolbarProps {
  handleOpenDialog: () => void;
}

const JournalToolbar = (props: EditToolbarProps) => {
  const { handleOpenDialog } = props;

  const handleAddEntry = () => {
    handleOpenDialog();
  };

  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      
      <Button variant="outlined" onClick={handleAddEntry}>
        <AddIcon />
        Add Entry
      </Button>
    </GridToolbarContainer>
  );
};

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

export default function Journal(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const supabase = useSupabaseClient();
  const {role, full_name, avatar_url, id} = useContext(UserContext);

  const router = useRouter();

  const [openDialog, setOpenDialog] = useState(false);
  const [openViewEntry, setOpenViewEntry] = useState(false);

  const [selectedJournalEntryId, setSelectedJournalEntryId] = useState<number>(0);

  const [openRejectModal, setOpenRejectModal] = useState(false);

  const [rejectEntryId, setRejectEntryId] = useState<number>();

  useEffect(() => {
    if(router.query.journal_entry_id){
      setSelectedJournalEntryId(+router.query.journal_entry_id);
      setOpenViewEntry(true);
    }
  }, []);


  const [loading, setLoading] = useState(true);
  const [journalEntries, setJournalEntries] = useState<
    {
      id: string;
      created_at: string;
      status: string;
      file_url: string;
      created_by: string;
    }[]
  >([]);

  const getJournalEntries = async () => {
    try {
      const { data, error } = await supabase
        .from(`journal_entry`)
        .select("*")
        .order("id", { ascending: true });
      //   console.log(data);
      if (error) {
        throw error;
      }
      setJournalEntries(data);
      setLoading(false);
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const handleApproveJournalEntry = async (journalEntryId: GridRowId) => {
    try {
      setLoading(true);
      const getJournalEntryCreator = (id: GridRowId) => {
        const obj = journalEntries.find(obj => obj.id == id);
        return obj ? obj.created_by : null;
      }
      const res = await fetch(`/api/journalEntry?status=approved&id=${journalEntryId}&approvedBy=${id}&modifiedBy=${getJournalEntryCreator(journalEntryId)}`, {
        method: "PUT"
      });
      if(!res.ok){
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      alert(error);
    }finally {
      setLoading(false);
      getJournalEntries();
    }
  }

  const handleRejectJournalEntry = async (id: GridRowId, reason: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/journalEntry?status=rejected&id=${id}&reason=${reason}`, {
        method: "PUT"
      });
      if(!res.ok){
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      alert(error);
    }finally {
      setLoading(false);
      getJournalEntries();
    }

  }

  useEffect(() => {
    getJournalEntries();

  }, [openDialog]);

  // Column Definition for journal entry grid.
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "#",
      width: 50,
      editable: false,
    },
    {
      field: "entry_date",
      headerName: "Entry Date",
      width: 150,
      editable: false,
      valueFormatter: ({ value }) => {
        const date = new Date(value);
        return date.toLocaleString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      editable: false,
      renderCell: (params) => {
        const status = params.value;
        let chipColor;
        switch (status) {
          case "pending":
            chipColor = "warning";
            break;
          case "approved":
            chipColor = "success";
            break;
          case "rejected":
            chipColor = "error";
            break;
          default:
            chipColor = "default";
            break;
        }
        //@ts-ignore
        return <Chip label={status} color={chipColor} />;
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 250,
      getActions: (params) => {
        const approveAction = (
          <GridActionsCellItem
            icon={<ThumbUp color="success" />}
            label="Approve"
            onClick={() => {
              handleApproveJournalEntry(params.id);
            }}
            disabled={params.row.status !== "pending"}
          />
        );

        const rejectAction = (
          <GridActionsCellItem
            icon={<ThumbDown color="warning" />}
            label="Reject"
            onClick={() => {
              // handleRejectJournalEntry(params.id)
              setRejectEntryId(+params.id);
              setOpenRejectModal(true);
            }}
            disabled={params.row.status !== "pending"}
          />
        );

        const viewAction = (
          <GridActionsCellItem
            icon={<Visibility />}
            label="view"
            onClick={() => {
              //@ts-ignore
              setSelectedJournalEntryId(params.id);

              setOpenViewEntry(true)}}
          />
        );

        const actions = [viewAction];

        if (params.row.status === "pending") {
          if(role == "admin" || role == "manager"){
            actions.push(approveAction);
            actions.push(rejectAction);
          }
        }

        return actions;
      },
    },
    {
      field: "file_url",
      headerName: "Attachment",
      width: 250,
      renderCell: (params) => {
        console.log(params.value);
        if(params.value == null){
          return <Typography>None</Typography>;
        }
        const fileUrl = params.value;
        const fileName = fileUrl.split("/").pop();
        const truncatedName =
          fileName.length > 14
            ? `${fileName.slice(0, 10)}...${fileName.slice(-4)}`
            : fileName;
        return (
          <Button
            variant="text"
            size="small"
            startIcon={<Download />}
            component="a"
            href={fileUrl}
            download={fileUrl}
          >
            {truncatedName}
          </Button>
        );
      },
    },
    {
      field: "type",
      headerName: "Type"
    }
  ];

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <>
      <Typography variant="h3" sx={{ paddingTop: "20px", paddingLeft: "20px" }}>
        Journal
      </Typography>
      <Box sx={{ height: "600px", marginLeft: "50px", marginRight: "50px" }}>
        <DataGrid
          rows={journalEntries}
          columns={columns}
          loading={loading}
          slots={{
            toolbar: JournalToolbar,
          }}
          slotProps={{
            toolbar: { handleOpenDialog },
          }}
        />
      </Box>
      {openDialog && (
        <JournalEntryDialog
          openDialog={openDialog}
          handleCloseDialog={handleCloseDialog}
          journalEntryNumber={
            +(journalEntries[journalEntries.length - 1].id + 1)
          }
        />
      )}

      {openViewEntry && (
        <ViewJournalEntry isOpen={openViewEntry} onClose={() => {
          setOpenViewEntry(false);
          // opens the view Journal Entry modal and adds the journal entry id as a url query param. On close removes that param.
          delete router.query.journal_entry_id;
          router.push(router);
        }} journalEntryId={selectedJournalEntryId}/>
      )}

      {openRejectModal && <RejectJournalEntryDialog open={openRejectModal} handleClose={() => setOpenRejectModal(false)} handleReject={handleRejectJournalEntry} entryId={rejectEntryId ?? -1}/>}
    </>
  );
}
