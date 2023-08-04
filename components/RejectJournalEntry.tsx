import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material'
import React from 'react'

interface RejectJournalEntryProps {
    open: boolean;
    handleClose: () => void;
    entryId: number;
    //@ts-ignore
    handleReject: (id, reason) => void;
}

function RejectJournalEntryDialog({ open, handleClose, entryId, handleReject }: RejectJournalEntryProps) {
  const [reason, setReason] = useState('')

  const handleReasonChange = (event: any) => {
    setReason(event.target.value)
  }

  const handleSubmit = () => {
    handleReject(entryId, reason)
    setReason('')
    handleClose();
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Reject Journal Entry #{entryId}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          multiline
          rows={4}
          margin="dense"
          label="Reason for rejection"
          value={reason}
          onChange={handleReasonChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!reason} variant="contained" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RejectJournalEntryDialog
