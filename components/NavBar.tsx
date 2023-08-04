"use client";
import { AccountCircle, HelpOutline, QuestionMarkOutlined } from "@mui/icons-material";
import {
  AppBar,
  Container,
  Toolbar,
  IconButton,
  Icon,
  Typography,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Avatar,
  Button,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
//@ts-ignore
import Logo from "../public/LedgerLite.png";
import { useRouter } from "next/router";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Image from "next/image";
import Link from "next/link";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { UserContext } from "./layouts/AuthLayout";


export default function NavBar(props: any) {
  const router = useRouter();
  const supabase = useSupabaseClient();



  const {role, full_name, avatar_url} = useContext(UserContext);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null);


  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = (slug: string) => {
    setAnchorEl(null);
    router.push(slug);
  };

  const handleCalendarMenu = (event: React.MouseEvent<HTMLElement>) => {
    setCalendarAnchor(event.currentTarget);
  };

  const handleCloseCalendarMenu = (slug: string) => {
    setCalendarAnchor(null);
    router.push(slug);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppBar
      position="static"
      color="transparent"
      sx={{ background: "#3c384f" }}
    >
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          <Tooltip title="Home">
            <IconButton
              size="small"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{
                mr: 2,
                p: 2,
                position: "relative",
                width: "100px",
                height: "100px",
              }}
              onClick={() => router.push("/")}
            >
              <Image src={Logo} fill alt="ledgerlite logo" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Calendar">
            <IconButton
              size="small"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{
                mr: 2,
                p: 2,
                position: "relative",
                width: "50px",
                height: "50px",
              }}
              onClick={handleCalendarMenu}
            >
              <CalendarMonthIcon />
            </IconButton>
          </Tooltip>

          <Menu
            id="menu-appbar"
            anchorEl={calendarAnchor}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(calendarAnchor)}
            onClose={handleCloseCalendarMenu}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar />
            </LocalizationProvider>
          </Menu>

          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "row", justifyContent: "flex-start" }}>
            <Tooltip title="View Dashbord">
              <Typography
                variant="h6"
                component="div"
                sx={{ paddingRight: "20px", paddingLeft: "20px" }}
              >
                <Link
                  href={"/"}
                  style={{ textDecoration: "none", color: "white" }}
                >
                  Dashboard
                </Link>
              </Typography>
            </Tooltip>

            <Tooltip title="View Accounts">
              <Typography variant="h6" component="div"
              sx={{ paddingRight: "20px" }}>
                <Link
                  href={"/accounts"}
                  style={{ textDecoration: "none", color: "white" }}
                >
                  Accounts
                </Link>
              </Typography>
            </Tooltip>

            <Tooltip title="View Journal">
              <Typography variant="h6" component="div"sx={{ paddingRight: "20px" }}>
                <Link
                  href={"/journal"}
                  style={{ textDecoration: "none", color: "white" }}
                >
                  Journal
                </Link>
              </Typography>
            </Tooltip>

            <Tooltip title="View Reports">
              <Typography variant="h6" component="div" sx={{ paddingRight: "20px" }}>
                <Link
                  href={"/reports"}
                  style={{ textDecoration: "none", color: "white" }}
                >
                  Reports
                </Link>
              </Typography>
            </Tooltip>
          </Box>

          <Tooltip title="Get Help">
              {/* <Typography variant="h6" component="div" sx={{ paddingRight: "20px" }}>
                <Link
                  href={"/help"}
                  style={{ textDecoration: "none", color: "white" }}
                >
                  Help
                </Link>
              </Typography> */}
              <Button variant="text" sx={{marginRight: "20px"}} onClick={() => router.push("/help")}>
                {/* <QuestionMarkOutlined />
                 */}
                 <HelpOutline sx={{marginRight: "10px"}} />
                Help
              </Button>
            </Tooltip>

          <Typography sx={{ paddingRight: "15px" }}>{full_name}</Typography>

          <Tooltip title="Manage Account">
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenu}
              color="inherit"
            >
               <Avatar  alt="profile picture"
        src={avatar_url ?? undefined}
        sx={{ width: 50, height: 50 }} >
          {full_name.charAt(0)}
        </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleCloseProfileMenu}
          >
            <MenuItem onClick={() => handleCloseProfileMenu("/profile")}>
              Profile
            </MenuItem>
            {role == "admin" ? (
              <MenuItem onClick={() => handleCloseProfileMenu("/admin")}>
                Administration
              </MenuItem>
            ) : null}
            <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
          </Menu>
          {/* </Box> */}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
