import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const ContactsRanking = ({ data }) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{i18n.t("dashboard.contacts.contact")}</TableCell>
          <TableCell align="right">{i18n.t("dashboard.contacts.tickets")}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((contact) => (
          <TableRow key={contact.contactId}>
            <TableCell>{contact.contact.name}</TableCell>
            <TableCell align="right">{contact.ticketsCount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ContactsRanking;
