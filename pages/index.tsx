import React, { useContext, useEffect, useState } from "react";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
  GetServerSidePropsContext,
  PreviewData,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { ParsedUrlQuery } from "querystring";
import { UserContext } from "../components/layouts/AuthLayout";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { makeStyles } from "@mui/styles";

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

export default function Index({}) {
  const { role, full_name, avatar_url } = useContext(UserContext);
  const supabase = useSupabaseClient();
  const [pendingEntries, setPendingEntries] = useState({
    count: 0,
    loading: true,
  });
  const [ratios, setRatios] = useState<
    { [key: string]: { value: number; title: string } } | undefined
  >();

  const [approvedAndRejected, setApprovedAndRejected] = useState({
    approved: 0,
    rejected: 0,
  });

  const getPendingEntries = async () => {
    const { data, error } = await supabase
      .from("journal_entry")
      .select("*")
      .eq("status", "pending");
    if (data?.length !== undefined) {
      setPendingEntries({ count: data.length, loading: false });
    }
  };

  const getLatestEntries = async () => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // One week ago
    const { data, error } = await supabase
      .from("journal_entry")
      .select("*")
      .gte("created_at", oneWeekAgo.toISOString())
      .order("created_at", { ascending: false })
      .in("status", ["approved", "rejected"]);

    if (data != null) {
      const approved = data.filter(
        (entry) => entry.status === "approved"
      ).length;
      const rejected = data.filter(
        (entry) => entry.status === "rejected"
      ).length;

      setApprovedAndRejected({
        approved: approved,
        rejected: rejected,
      });
    }
  };

  const getFinancialRatios = async () => {
    try {
      const res = await fetch("/api/financialRatios", { method: "GET" });
      // console.log(res);
      if (!res.ok) {
        throw new Error("Couldn't get your dashboard data");
      }
      const responseObject = await res.json();
      setRatios(responseObject);
    } catch (error: any) {
      alert(error.message || error);
    }
  };
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const percentageFormatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    getPendingEntries();
    getFinancialRatios();
    getLatestEntries();
  }, []);

  useEffect(() => {
    console.log(ratios);
  }, [ratios]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Card
        sx={{
          marginLeft: "30px",
          marginTop: "30px",
          width: "50%",
          height: "400px",
        }}
        elevation={5}
      >
        <CardHeader title={`Hey, ${full_name}`} />

        <CardContent>
          {pendingEntries.loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rectangular" height={40} />

              <Skeleton variant="rectangular" height={60} />
            </Stack>
          ) : (
            <>
              {role == "admin" ? (
                <Typography variant="h5">
                  {" "}
                  You have {pendingEntries.count} pending{" "}
                  <Link href="/journal" style={{ color: "white" }}>
                    journal entries{" "}
                  </Link>{" "}
                  waiting to be approved.
                </Typography>
              ) : null}
            </>
          )}
          <Typography variant="h6" sx={{ marginTop: "30px" }}>
            In the last 7 days, {approvedAndRejected.approved} journal entries
            were approved, and {approvedAndRejected.rejected} were rejected.
          </Typography>
        </CardContent>
      </Card>

      <Box>
        <Typography
          variant="h3"
          sx={{ marginLeft: "40px", marginTop: "40px", marginBottom: "40px" }}
        >
          Important Information at a glance:
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-around",
        }}
      >
        <Card sx={{ width: "30%", height: "400px" }} elevation={5}>
          <CardHeader title={ratios?.grossProfit?.title} />
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="h2">
              {currencyFormatter.format(ratios?.grossProfit?.value ?? 0)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ width: "30%", height: "400px" }} elevation={5}>
          {ratios?.grossProfitMargin != undefined ? (
            <>
              <CardHeader title={ratios?.grossProfitMargin?.title} />
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography variant="h2">
                  {percentageFormatter.format(ratios?.grossProfitMargin?.value ?? 0)}
                  <LinearProgress
                    variant="determinate"
                    value={ratios?.grossProfitMargin?.value * 100}
                    // value={10}
                    sx={{
                      backgroundColor: "white",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: getColor(
                          ratios?.grossProfitMargin?.value * 100
                          // 70
                        ),
                      },
                    }}
                  />
                </Typography>
              </CardContent>
            </>
          ) : null}
        </Card>
        <Card sx={{ width: "30%", height: "400px" }} elevation={5}>
          {ratios?.currentRatio != undefined ? (
            <>
              <CardHeader title={ratios?.currentRatio?.title} />
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography variant="h2">
                  {ratios?.currentRatio?.value.toFixed(2)}
                  <LinearProgress
                    variant="determinate"
                    value={
                      ratios?.currentRatio?.value >= 1
                        ? 100
                        : ratios?.currentRatio?.value * 100
                    }
                    // value={50}
                    sx={{
                      backgroundColor: "white",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: getRatioColor(
                          ratios?.currentRatio?.value ?? 0
                          // 0.1
                        ),
                      },
                    }}
                  />
                </Typography>
              </CardContent>
            </>
          ) : null}
        </Card>
        <Card
          sx={{
            width: "30%",
            height: "400px",
            marginTop: "50px",
            alignSelf: "flex-start",
            marginBottom: "100px",
          }}
          elevation={5}
        >
          {ratios?.debtToEquity !== undefined ? 
          <>
          <CardHeader title={ratios?.debtToEquity?.title} />
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="h2">
              {ratios?.debtToEquity?.value.toFixed(3)}
              
              <LinearProgress
                variant="determinate"
                value={Math.ceil((1 - ratios?.debtToEquity?.value) * 100)}
                // value={10}
                sx={{
                  backgroundColor: "white",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: 
                    getColor(
                      Math.ceil((1 - ratios?.debtToEquity?.value) * 100) ?? 0
                      // 1
                    )
                    ,
                  },
                }}
              />
            </Typography>
          </CardContent>
          </>
        : null}
        </Card>
      </Box>
    </Box>
  );
}

function getColor(value: number) {
  const red = (255 * Math.min(100 - value, 50)) / 50;
  const green = (255 * Math.min(value, 50)) / 50;
  const blue = 0;
  const color = `rgb(${red}, ${green}, ${blue})`;
  return color;
}

function getRatioColor(ratioValue: number) {
  const greenValue = Math.min(ratioValue, 2.0) / 2.0;
  const redValue = Math.max(0, 1 - ratioValue / 2.0);
  const blueValue = 0;
  const red = Math.floor(255 * redValue);
  const green = Math.floor(255 * greenValue);
  const blue = Math.floor(255 * blueValue);
  const color = `rgb(${red}, ${green}, ${blue})`;
  return color;
}

