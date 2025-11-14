'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  adherence: {
    label: 'Adherence',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const patientComplianceData = [
  { month: 'Jan', adherence: 88 },
  { month: 'Feb', adherence: 82 },
  { month: 'Mar', adherence: 85 },
  { month: 'Apr', adherence: 91 },
  { month: 'May', adherence: 78 },
  { month: 'Jun', adherence: 95 },
];


export function PatientCompliance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Compliance</CardTitle>
        <CardDescription>Medication adherence over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patientComplianceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="adherence"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
