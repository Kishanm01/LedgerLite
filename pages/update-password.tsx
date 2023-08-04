import { Box, Button, TextField, Typography } from "@mui/material";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
  PreviewData,
} from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import React, { useEffect } from "react";

export default function UpdatePassword() {
  const supabase = useSupabaseClient();

  const [password, setPassword] = React.useState("");
  const [rePassword, setRePassword] = React.useState("");

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const res = await supabase.auth.getUser();
      if(!res.data.user){
        router.push('/');
      }
    }

    checkUser();
  }, []);

  const updatePassword = async () => {

    try{
      // Attempt to update password
            const {data, error} = await supabase.auth.updateUser({password: password});
        
            if(error){
                throw error;
            }
            alert("Succesfully updated password, please login");
            await supabase.auth.signOut();
    }catch(error: any){
        alert(error.error_description || error.message);
    }
  }

  return (
    <>
      <Head>
        <title>Update Password</title>
      </Head>
      <Box sx={{display: "flex", flexDirection: "column", width: "30%", margin: "auto", textAlign: "center"}}>
      <Typography variant="h3">Please enter your new password:</Typography>
      <TextField
        variant="outlined"
        label="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        />

      <TextField
        variant="outlined"
        label="Re-Enter Password"
        type="password"
        onChange={(e) => setRePassword(e.target.value)}
        />
      <Button variant="contained" onClick={async () => await updatePassword()}>Submit</Button>
    </Box>
    </>
  );
}
