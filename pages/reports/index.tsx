import React, { useContext, useEffect, useState } from "react";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
  GetServerSidePropsContext,
  PreviewData,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { ParsedUrlQuery } from "querystring";
import { UserContext } from "../../components/layouts/AuthLayout";
import {
  Box,
  Card,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
// import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
  AccountBalance,
  AccountBalanceWallet,
  Balance,
  Money,
} from "@mui/icons-material";
import Link from "next/link";

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

export default function Reports({}) {
  const { role, full_name, avatar_url } = useContext(UserContext);
  const [supabase] = useState(() =>
    createBrowserSupabaseClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  );

  // View all available reports.

  const getRecentReports = async () => {
    const res = await supabase.storage.from('reports').list();
    console.log(res);
  };

  useEffect(() => {
    getRecentReports();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      <Paper
        sx={{
          marginLeft: "30px",
          marginTop: "30px",
          // width: "40%",
          flex: 1,
        }}
        elevation={5}
      >
        <List>
          <Link
            href="/reports/balanceSheet"
            passHref
            style={{ textDecoration: "none", color: "white" }}
          >
            <ListItemButton>
              <ListItemIcon>
                <AccountBalanceWallet />
              </ListItemIcon>
              <ListItemText primary="Balance Sheet" />
            </ListItemButton>
          </Link>
          <Divider />

          <Link
            href="/reports/trialBalance"
            passHref
            style={{ textDecoration: "none", color: "white" }}
          >
            <ListItemButton>
              <ListItemIcon>
                <Balance />
              </ListItemIcon>
              <ListItemText primary="Trial Balance" />
            </ListItemButton>
          </Link>

          <Divider />
          <Link
            href="/reports/incomeStatement"
            passHref
            style={{ textDecoration: "none", color: "white" }}
          >
            <ListItemButton>
              <ListItemIcon>
                <Money />
              </ListItemIcon>
              <ListItemText primary="Income Statement" />
            </ListItemButton>
          </Link>
          <Divider />
          <Link
            href="/reports/retainedEarnings"
            passHref
            style={{ textDecoration: "none", color: "white" }}
          >
            <ListItemButton>
              <ListItemIcon>
                <AccountBalance />
              </ListItemIcon>
              <ListItemText primary="Retained Earnings" />
            </ListItemButton>
          </Link>
        </List>
      </Paper>

      <Card
        sx={{
          marginLeft: "30px",
          marginTop: "30px",
          marginRight: "30px",
          // width: "40%",
          flex: 1,
        }}
        elevation={5}
      >
        <CardHeader title="Recent Reports:" />
      </Card>
    </Box>
  );
}
