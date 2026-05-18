"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  penjualan: {
    label: "Penjualan",
    color: "hsl(var(--primary))",
  },
  pengeluaran: {
    label: "Pengeluaran",
    color: "hsl(var(--muted))",
  },
};

interface SalesChartProps {
  data: Array<{ month: string; penjualan: number; pengeluaran: number }>;
}

export default function SalesChart({ data }: SalesChartProps) {
  const chartData = data.length > 0 ? data : [
    { month: "-", penjualan: 0, pengeluaran: 0 },
  ];

  return (
    <Card className="flex flex-col h-full border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Penjualan vs Pengeluaran</CardTitle>
        <span className="text-xs text-muted-foreground">Jutaan (Rp)</span>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-xs text-muted-foreground"
                tickFormatter={(value) => `${value}M`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="penjualan" fill="var(--color-penjualan)" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="pengeluaran" fill="var(--color-pengeluaran)" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
