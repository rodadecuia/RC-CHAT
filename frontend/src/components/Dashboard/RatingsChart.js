import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { i18n } from "../../translate/i18n";

const RatingsChart = ({ data }) => {
  const chartData = Object.entries(data).map(([star, count]) => ({
    name: `${star} ${i18n.t("dashboard.csat.stars")}`,
    value: count,
  }));
  const COLORS = ["#FF0000", "#FFBF00", "#FFFF00", "#80FF00", "#00FF00"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default RatingsChart;
