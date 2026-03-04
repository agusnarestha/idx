"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ShareChartProps {
  aggregates?: {
    origin: { name: string; value: number; percentage: number }[];
    topInvestors: { name: string; value: number }[];
  };
}

const CHART_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#dc2626",
  "#a855f7",
  "#0ea5e9",
  "#ec4899",
];

export function ShareChart({ aggregates }: ShareChartProps) {
  if (!aggregates) return null;

  const { origin: originData, topInvestors } = aggregates;

  if (!originData || originData.length === 0) return null;

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-xl text-sm text-foreground">
          <p className="font-semibold">{label}</p>
          <p className="text-blue font-medium">
            {payload[0].value.toLocaleString()} shares
          </p>
        </div>
      );
    }
    return null;
  };

  const tooltipStyle = {
    borderRadius: "12px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
    color: "var(--text)",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 relative z-10">
      <div className="bg-card rounded-2xl border border-border p-6 flex flex-col">
        <h3 className="text-lg font-extrabold text-foreground mb-6 flex items-center gap-2">
          Origin Distribution
        </h3>
        <div className="h-64 relative flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={originData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={8}
                dataKey="percentage"
                stroke="none"
              >
                {originData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.name === "Local" ? "#22c55e" : "#3b82f6"}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(
                  value: number | string | Array<number | string> | undefined,
                ) => (value ? Number(value).toFixed(2) + "%" : "0%")}
                contentStyle={tooltipStyle}
                itemStyle={{ fontWeight: 600 }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "var(--muted)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 flex flex-col">
        <h3 className="text-lg font-extrabold text-foreground mb-6 flex items-center gap-2">
          Top 10 Investors Dashboard
        </h3>
        <div className="h-64 relative flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topInvestors}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={130}
                tick={{ fontSize: 11, fill: "var(--muted)", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--dim)" }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
                {topInvestors.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
