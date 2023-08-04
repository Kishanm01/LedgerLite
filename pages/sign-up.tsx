import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CardMedia,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import Logo from "../assets/LedgerLite.png";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Image from "next/image";
import Link from "next/link";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
  GetServerSidePropsContext,
  PreviewData,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { ParsedUrlQuery } from "querystring";
import { FormInputText } from "../components/formComponents/formInputText";
import { Controller, useForm } from "react-hook-form";

type bookUseFormType = {
  firstName: string;
  lastName: string;
  dob: string;
  address: string;
  email: string;
  password: string;
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

export default function SignUp() {
  const [loading, setLoading] = useState(false);

  // react hook form to validate the sign-up form
  const methods = useForm<bookUseFormType>();
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    register,
    formState: { errors },
  } = methods;

  const supabase = useSupabaseClient();

  const onSubmit = handleSubmit(async (data) => {
    // console.log(data);
    setLoading(true);
    try {
      // submits data to userRequests table
      const { data: userRequest, error } = await supabase
        .from("userRequests")
        .insert({ ...data, status: "pendingReview" }).select();

      const res = await fetch("/api/newUser", {
        method: "POST",
        body: JSON.stringify(userRequest),
        headers: {
          'Content-Type': 'application/json'
        },
      });

      console.log(res);
    } catch (error) {
      console.error(error);
    } finally{
      //resets the form
      setLoading(false);
      reset();
      alert("Your information has been submitted and will be review by the administrators.")
    }
  });

  return (
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
      <Box
        sx={{
          display: "flex",
          height: "100%",
          width: "50%",
          justifyContent: "space-around",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Image src={Logo} fill alt="LedgerLite Logo" />
      </Box>
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          height: "100%",
          width: "50%",
          display: "grid",
          gridTemplateColumns: "350px 350px",
          gridTemplateRows: "50px 50px 50px 50px 50px 50px 70px 50px",
          gridTemplateAreas:
            '"header header" "Switch Switch" "First Last" "Email Email" "Address Address" "Birth Birth" "Password Password" "Submit Submit" "Terms Terms"',
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
          sx={{ paddingBottom: "0px" }}
        >
          Sign Up
        </Typography>

        <Typography
          variant="subtitle1"
          gridArea={"Switch"}
          justifySelf={"Center"}
        >
          Already have an account?{" "}
          <Link style={{ color: "#FFF" }} href="/login">
            Login
          </Link>
        </Typography>

        <FormInputText
          name="firstName"
          label="First Name"
          type={"text"}
          control={control}
          sx={{ gridArea: "First" }}
          rules={{
            required: { value: true, message: "Please enter your first name" },
          }}
        />

        <FormInputText
          name="lastName"
          label="Last Name"
          type={"text"}
          control={control}
          sx={{ gridArea: "Last" }}
          rules={{
            required: { value: true, message: "Please enter your last name" },
          }}
        />

        <FormInputText
          name="email"
          label="Email"
          type={"email"}
          control={control}
          sx={{ gridArea: "Email" }}
          rules={{
            required: { value: true, message: "Please enter your email" },
          }}
        />

        <FormInputText
          name="address"
          label="Address"
          type={"text"}
          control={control}
          sx={{ gridArea: "Address" }}
          rules={{
            required: { value: true, message: "Please enter a address" },
          }}
        />

        <FormInputText
          name="dob"
          label="Date of Birth"
          type={"date"}
          InputLabelProps={{ shrink: true }}
          control={control}
          sx={{ gridArea: "Birth" }}
          rules={{
            required: { value: true, message: "Please enter a Date of Birth" },
          }}
        />
       <Controller
        name="password"
        control={control}
        rules={{
          required: true,
          minLength: 8,
          pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/,
          validate: (value) => /^[A-Za-z]/.test(value)
        }}
        render={({ field }) => (
          <TextField
            inputRef={field.ref}
            error={!!errors.password}
            sx={{gridArea: "Password"}}
            helperText={
              errors.password && (
                errors.password.type === 'required' ? 'Password is required' :
                errors.password.type === 'minLength' ? 'Password must be at least 8 characters' :
                errors.password.type === 'pattern' ? 'Password must start with a letter, and contain at least one letter, one number and one special character (@$!%*#?&)' :
                errors.password.type === 'validate' ? 'Password must start with a letter' :
                null
              )
            }
            label="Password"
            type="password"
            variant="outlined"
            {...field}
          />
        )}
      />

        <Button type="submit" variant="contained" sx={{ gridArea: "Submit" }}>
          Request For Approval
        </Button>

        <Typography
          variant="subtitle2"
          gridArea={"Terms"}
          justifySelf={"Center"}
        >
          By clicking the "Request For Approval" button, you are creating an
          account, and you agree to the{" "}
          <Link style={{ color: "#FFF" }} href="/terms-of-use">
            Terms of Use
          </Link>
          .
        </Typography>
      </Box>
      <Backdrop sx={{ color: "#fff" }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
