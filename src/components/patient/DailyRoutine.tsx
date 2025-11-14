'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dailyRoutines } from '@/lib/data';

function CircularProgress({ progress }: { progress: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg className="w-20 h-20" viewBox="0 0 70 70">
      <circle
        className="text-secondary"
        strokeWidth="5"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="35"
        cy="35"
      />
      <circle
        className="text-primary"
        strokeWidth="5"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="35"
        cy="35"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        className="text-sm font-bold fill-foreground"
      >
        {`${progress}%`}
      </text>
    </svg>
  );
}

export function DailyRoutine() {
  return (
    <>
      {dailyRoutines.map((routine, index) => (
        <Card key={index}>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <CircularProgress progress={routine.progress} />
            <p className="mt-2 font-semibold text-sm">{routine.name}</p>
            <p className="text-xs text-muted-foreground">{routine.time}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
