'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { medications } from '@/lib/data';
import { CheckCircle, Clock, Pill, PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { setMedicationReminder } from '@/ai/flows/voice-assistant-medication-reminders';
import React from 'react';

export function MedicationSchedule() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSetReminder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const medicationName = formData.get('medicationName') as string;
    const dosage = formData.get('dosage') as string;
    const time = formData.get('time') as string;
    const frequency = formData.get('frequency') as string;

    if (!medicationName || !dosage || !time || !frequency) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields to set a reminder.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Setting Reminder...',
      description: `Setting a reminder for ${medicationName}.`,
    });

    try {
      const result = await setMedicationReminder({
        userId: 'user123',
        medicationName,
        dosage,
        time,
        frequency,
      });

      if (result.success) {
        toast({
          title: 'Reminder Set!',
          description: result.message,
        });
        setOpen(false);
        formRef.current?.reset();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          'Could not set reminder. Please try again. ' +
          (error instanceof Error ? error.message : ''),
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Medications</CardTitle>
        <CardDescription>
          Here is your medication schedule for today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {medications.map((med) => (
            <li key={med.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-full ${med.taken ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}
                >
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{med.name}</p>
                  <p className="text-sm text-muted-foreground">{med.dosage}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {med.taken ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
                <span>{med.time}</span>
              </div>
            </li>
          ))}
        </ul>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mt-6">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Set Medication Reminder</DialogTitle>
              <DialogDescription>
                Fill in the details for your new medication reminder.
              </DialogDescription>
            </DialogHeader>
            <form ref={formRef} onSubmit={handleSetReminder} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="medicationName" className="text-right">
                  Medication
                </Label>
                <Input
                  id="medicationName"
                  name="medicationName"
                  placeholder="e.g., Paracetamol"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dosage" className="text-right">
                  Dosage
                </Label>
                <Input
                  id="dosage"
                  name="dosage"
                  placeholder="e.g., 500mg"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">
                  Frequency
                </Label>
                <Input
                  id="frequency"
                  name="frequency"
                  placeholder="e.g., Twice daily"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                  Time
                </Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <Button type="submit">Set Reminder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
