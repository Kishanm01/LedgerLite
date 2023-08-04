import { Box, Button, TextField, Typography, CardMedia } from "@mui/material";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext, PreviewData, NextApiRequest, NextApiResponse } from "next";
import { ParsedUrlQuery } from "querystring";
import React from "react";
import { useState, useEffect } from "react";
import Logo from "../assets/LedgerLite.png";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Router, useRouter } from "next/router";
import Image from "next/image";


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
  
    if (session)
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    return {
      props: {
        user: false,
      },
    };
  };

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const supabase = useSupabaseClient();
    const router = useRouter();


  
    const handleLogin = async (e: { preventDefault: () => void }) => {
      e.preventDefault();
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: "https://ledgerlite.us/update-password",
        });
        alert("Check your email for the login link!");
      } catch (error: any) {
        alert(error.error_description || error.message);
      } finally {
        setLoading(false);
        setEmail("");
      }
    };
  
    return (
      //Main box
      <Box
        sx={{
          background: "#3c384f",
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
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
            gridTemplateRows: "30px 10px 30px 75px 50px",
            gridTemplateAreas:
              '"header header" "subtitle subtitle" "Switch Switch" "Email Email" "Back Submit"',
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
            Forgot Password
          </Typography>
  
          <Typography
            gridArea={"Switch"}
            justifySelf={"Center"}
            variant="subtitle1"
          >
            Enter your email to recieve a forgot password link
          </Typography>
  
          <TextField
            sx={{ gridArea: "Email" }}
            variant="outlined"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
  
          <Button variant="outlined" sx={{ gridArea: "Back"}} color = "secondary" onClick={() => {
              router.back();
            }}>
            Back
          </Button>
  
          <Button type="submit" variant="contained" sx={{ gridArea: "Submit" }}>
            Submit
          </Button>
        </Box>
      </Box>
    );
  }
  