import { Box, Button, Link, TextField, Typography } from "@mui/material";
import Head from "next/head";
import React, { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Logo from "../assets/LedgerLite.png";
import Image from "next/image";
import { useRouter } from "next/router";
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { GetServerSidePropsContext, PreviewData, NextApiRequest, NextApiResponse } from "next";
import { ParsedUrlQuery } from "querystring";

export const getServerSideProps = async (ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData> | { req: NextApiRequest; res: NextApiResponse<any>; }) => {
    // Create authenticated Supabase Client
    const supabase = createServerSupabaseClient(ctx)
    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession()
  
    if (session)
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
      return {
        props: {
          user: false
        }
      };
  }

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [emailOrPassword, setEmailOrPassword] = useState("");
  const [password, setPassword] = useState("");
  const supabase = useSupabaseClient();
  const router = useRouter();

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      if(emailOrPassword.indexOf("@") !== -1){
        // sign in with email
        const {data, error} = await supabase.auth.signInWithPassword({
          email: emailOrPassword, password
        });
        if (error) throw error;
        router.push("/");
      }else{
        // find the users email, and then login.
        const res = await fetch(`/api/lookupUsername?username=${emailOrPassword}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const email = await res.json();
        const {data, error} = await supabase.auth.signInWithPassword({
          email, password
        });
        if (error) throw error;
        // push to homepage.
        router.push("/");
      }

    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Ledger Lite</title>
      </Head>
      <Box
        sx={{
          background: "#3c384f",
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {/*Logo*/}
        <Box
          sx={{
            display: "flex",
            position: "relative",
            height: "100%",
            width: "50%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Image src={Logo} alt="ledgerlite logo" fill />
        </Box>

        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            height: "100%",
            width: "50%",
            display: "grid",
            gridTemplateColumns: "350px 350px",
            gridTemplateRows: "30px 10px 30px 50px 50px 20px 50px",
            gridTemplateAreas:
              '"header header" "subtitle subtitle" "Switch Switch" "Email Email" "Password Password" ". Forgot" "Submit Submit"',
            columnGap: "10px",
            rowGap: "20px",
            alignContent: "center",
          }}
        >
          <Typography
            gridArea={"header"}
            justifySelf={"Center"}
            className="header"
            variant="h4"
            component={"h4"}
            sx={{ paddingBottom: "50px" }}
          >
            Ledgerlite
          </Typography>

          <Typography
            gridArea={"subtitle"}
            justifySelf={"Center"}
            className="header"
            variant="subtitle1"
            component={"h1"}
            sx={{ paddingBottom: "50px" }}
          >
            Log in to manage your account
          </Typography>

          <Typography
            gridArea={"Switch"}
            justifySelf={"Center"}
            variant="subtitle1"
          >
            Don't have an account?{" "}
            <Link style={{ color: "#FFF" }} href="/sign-up">
              Sign up
            </Link>
          </Typography>

          <TextField
            sx={{ gridArea: "Email" }}
            variant="outlined"
            label="Email/Username"
            type="text"
            onChange={(e) => setEmailOrPassword(e.target.value)}
          />
          <TextField
            sx={{ gridArea: "Password" }}
            variant="outlined"
            label="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="text"
            sx={{ gridArea: "Forgot", justifySelf: "end" }}
            onClick={() => {
              router.push("/forgot-password");
            }}
          >
            Forgot your password?
          </Button>

          <Button type="submit" variant="contained" sx={{ gridArea: "Submit" }}>
            Login
          </Button>
        </Box>
      </Box>
    </>
  );
}
