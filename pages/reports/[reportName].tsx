import { ArrowBackIos, Download, Email } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  OutlinedInput,
  Toolbar,
  Typography,
} from "@mui/material";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
  GetServerSidePropsContext,
  PreviewData,
  NextApiRequest,
  NextApiResponse,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import React, { useEffect, useState } from "react";
import { DateRangePicker, DateRange } from "mui-daterange-picker";
import { format } from "date-fns";

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

const ReportName = () => {
  const router = useRouter();
  const { reportName } = router.query;

  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange>({});
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  // Dynamically generated page based on what button you click in the reports/index.tsx
  



  // Format the start date as a string in the format "YYYY-MM-DD"
  const startDateString = dateRange.startDate
    ? format(dateRange?.startDate ?? 0, "yyyy-MM-dd")
    : "";

  const endDateString = dateRange.startDate
    ? format(dateRange?.endDate ?? 0, "yyyy-MM-dd")
    : "";

  const toggleDatePicker = () => setOpenDatePicker(!openDatePicker);

  const toCapitalCase = (str: string) => {
    // Split the string into words using a regular expression
    const words = str.match(/[A-Za-z][a-z]*/g) || [];

    // Capitalize the first letter of each word and join them
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const generateReport = async () => {
    try {
      const res = await fetch(
        `/api/reports?reportType=${reportName}&start=${startDateString}&end=${endDateString}`
      );
      const data = await res.json();
      console.log(data);
      setPdfUrl(data.publicUrl);
    } catch (error) {}
  };

  return (
    <>
      <Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            marginTop: "20px",
            marginLeft: "20px",
            alignItems: "center",
          }}
        >
          <Link
            href="/reports"
            passHref
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Button variant="text">
              {" "}
              <ArrowBackIos /> Back to Reports
            </Button>
          </Link>

          <Typography variant="h3" sx={{ marginLeft: "10%" }}>
            {/* @ts-ignore */}
            {toCapitalCase(reportName)}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginLeft: "30px",
            }}
          >
            <FormControl>
              <InputLabel htmlFor="start-date-input" shrink={true}>
                Start Date
              </InputLabel>
              <OutlinedInput
                notched={true}
                id="start-date-input"
                size="small"
                label="Start Date"
                inputProps={{ shrink: true }}
                placeholder=""
                sx={{
                  svg: { color: "#fff" },
                  input: { color: "#fff" },
                }}
                type="date"
                onClick={(event) => {
                  event.preventDefault();
                  toggleDatePicker();
                }}
                value={startDateString}
              />
            </FormControl>
            <Typography
              variant="h4"
              sx={{ marginLeft: "10px", marginRight: "10px" }}
            >
              -
            </Typography>
            <FormControl>
              <InputLabel htmlFor="end-date-input" shrink={true}>
                End Date
              </InputLabel>
              <OutlinedInput
                size="small"
                notched={true}
                id="end-date-input"
                label="End Date"
                type="date"
                onClick={(event) => {
                  event.preventDefault();
                  toggleDatePicker();
                }}
                value={endDateString}
              />
            </FormControl>
          </Box>

          <Button
            variant="contained"
            sx={{ marginLeft: "30px" }}
            disabled={dateRange.startDate == undefined ? true : false}
            onClick={generateReport}
          >
            {" "}
            Generate
          </Button>
        </Box>
      </Box>
      <Box sx={{ marginLeft: "30%", width: "36%" }}>
        <DateRangePicker
          open={openDatePicker}
          toggle={toggleDatePicker}
          onChange={(range) => setDateRange(range)}
        />
      </Box>
        {pdfUrl !== null ? (
            <iframe src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`} frameBorder={0} style={{marginTop: "50px", width: "100%", height: "80vh"}}></iframe>
        ) :  null}
    </>
  );
};

export default ReportName;
