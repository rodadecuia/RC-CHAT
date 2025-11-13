import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    height: "100%",
  },
  header: {
    marginBottom: theme.spacing(2),
  },
}));

const RatingsReport = ({ dateFrom, dateTo }) => {
  const classes = useStyles();
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const { data } = await api.get("/dashboard/ratings", {
          params: {
            date_from: dateFrom,
            date_to: dateTo,
          },
        });
        setReportData(data);
      } catch (err) {
        toastError(err);
      }
    };

    if (dateFrom && dateTo) {
      fetchReportData();
    }
  }, [dateFrom, dateTo]);

  const renderRatingsByStars = () => {
    const data = Object.entries(reportData.ratingsByStars).map(([star, count]) => ({
      name: `${star} ${i18n.t("dashboard.csat.stars")}`,
      value: count,
    }));
    const COLORS = ["#FF0000", "#FFBF00", "#FFFF00", "#80FF00", "#00FF00"];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderAvgRatingsByUser = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={reportData.avgRatingsByUser}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgRate" fill="#8884d8" name={i18n.t("dashboard.csat.avgRate")} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (!reportData) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper className={classes.paper}>
          <Typography variant="h6" className={classes.header}>
            {i18n.t("dashboard.csat.avgRate")}
          </Typography>
          <Typography variant="h4">{reportData.avgRate.toFixed(2)}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper className={classes.paper}>
          <Typography variant="h6" className={classes.header}>
            {i18n.t("dashboard.csat.ratingsByStars")}
          </Typography>
          {renderRatingsByStars()}
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Typography variant="h6" className={classes.header}>
            {i18n.t("dashboard.csat.avgRatingsByUser")}
          </Typography>
          {renderAvgRatingsByUser()}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default RatingsReport;
