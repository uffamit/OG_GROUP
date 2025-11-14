'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, FileText, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const recentPrescriptions = [
  {
    id: 1,
    patientName: 'Sarah Johnson',
    medication: 'Lisinopril 10mg',
    date: '2024-07-15',
    status: 'Active',
  },
  {
    id: 2,
    patientName: 'Michael Smith',
    medication: 'Atorvastatin 20mg',
    date: '2024-07-14',
    status: 'Active',
  },
  {
    id: 3,
    patientName: 'Emily Brown',
    medication: 'Metformin 500mg',
    date: '2024-07-10',
    status: 'Completed',
  },
];

export default function DoctorPrescriptionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage patient prescriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Prescription</CardTitle>
            <CardDescription>
              Fill out the form to create a new prescription for a patient.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient</Label>
                <Select>
                  <SelectTrigger id="patient">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient1">Sarah Johnson</SelectItem>
                    <SelectItem value="patient2">Michael Smith</SelectItem>
                    <SelectItem value="patient3">Emily Brown</SelectItem>
                    <SelectItem value="patient4">David Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medication">Medication</Label>
                <Input
                  id="medication"
                  placeholder="e.g., Lisinopril"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 10mg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once daily</SelectItem>
                    <SelectItem value="twice">Twice daily</SelectItem>
                    <SelectItem value="thrice">Three times daily</SelectItem>
                    <SelectItem value="asneeded">As needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 30 days"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional instructions or notes..."
                  rows={3}
                />
              </div>

              <Button className="w-full" type="submit">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Prescription
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
            <CardDescription>
              View your recently created prescriptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{prescription.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {prescription.medication}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                      <Calendar className="h-3 w-3" />
                      {prescription.date}
                    </p>
                    <Badge
                      variant={
                        prescription.status === 'Active' ? 'default' : 'secondary'
                      }
                    >
                      {prescription.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
