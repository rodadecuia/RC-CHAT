import React from "react";
import {
  Modal,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  makeStyles,
} from "@material-ui/core";
import { format } from "date-fns";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    width: 500,
    maxHeight: "80%",
    overflowY: "auto",
  },
}));

const TicketLog = ({ open, onClose, log }) => {
  const classes = useStyles();

  return (
    <Modal open={open} onClose={onClose} className={classes.modal}>
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Histórico do Ticket
        </Typography>
        <List>
          {log.map((entry, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${entry.username} ${entry.action} o ticket`}
                secondary={format(new Date(entry.timestamp), "dd/MM/yyyy HH:mm")}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Modal>
  );
};

export default TicketLog;
