import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const RatingsByUser = ({ data }) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{i18n.t("dashboard.csat.user")}</TableCell>
          <TableCell align="right">{i18n.t("dashboard.csat.avgRate")}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((user) => (
          <TableRow key={user.userId}>
            <TableCell>{user.name}</TableCell>
            <TableCell align="right">{user.avgRate.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RatingsByUser;
