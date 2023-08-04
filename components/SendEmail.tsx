import { useContext, useEffect, useState } from "react";
import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "./layouts/AuthLayout";

interface SendEmailProps {
    open: boolean;
    handleClose: () => void;
}

const SendEmail = ({ open, handleClose }: SendEmailProps) => {
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [message, setMessage] = useState("");
  const supabase = useSupabaseClient();

  const { role, full_name, avatar_url } = useContext(UserContext);
  const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => {
    getManagers();
  }, []);

  const getManagers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role, email")
        .neq("role", "regular");
  
      if (error) {
        throw error;
      }
  
      if (data) {
        setManagers(data);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.error_description || error.message);
    }
  };
  

  const handleSend = async () => {
    const reqBody = {
      to: selectedManagers,
      body: message,
      sender: {
        full_name: full_name,
      },
    };

    try {
      const res = await fetch("/api/sendEmail", {
        method: "POST",
        body: JSON.stringify(reqBody),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      handleClose();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Send Email</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ marginTop: "30px" }}>
          <InputLabel id="manager-select-label">Managers and Admins</InputLabel>
          <Select
            labelId="manager-select-label"
            id="manager-select"
            multiple
            value={selectedManagers}
            onChange={(event: any) => setSelectedManagers(event.target.value)}
            inputProps={{ "aria-label": "Select managers and admins" }}
          >
            {managers.map((manager) => (
              <MenuItem key={manager.name} value={manager.email}>
                {manager.full_name} - {manager.role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          sx={{ marginTop: "50px" }}
          fullWidth
          label="Message"
          multiline
          rows={7}
          variant="outlined"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          color="primary"
          disabled={selectedManagers.length === 0}
          variant="contained"
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendEmail;
