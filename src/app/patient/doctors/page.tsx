'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Star, Calendar } from 'lucide-react';

const doctors = [
  {
    id: 1,
    name: 'Dr. Ben Carter',
    specialty: 'Dermatologist',
    rating: 4.9,
    reviews: 127,
    avatar: 'https://picsum.photos/seed/doc2/100/100',
    available: true,
  },
  {
    id: 2,
    name: 'Dr. Chloe Davis',
    specialty: 'General Physician',
    rating: 4.8,
    reviews: 203,
    avatar: 'https://picsum.photos/seed/doc3/100/100',
    available: true,
  },
  {
    id: 3,
    name: 'Dr. Evelyn Reed',
    specialty: 'Cardiologist',
    rating: 4.9,
    reviews: 156,
    avatar: 'https://picsum.photos/seed/doc1/100/100',
    available: false,
  },
  {
    id: 4,
    name: 'Dr. Marcus White',
    specialty: 'Neurologist',
    rating: 4.7,
    reviews: 98,
    avatar: 'https://picsum.photos/seed/doc4/100/100',
    available: true,
  },
];

export default function FindDoctorsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Doctors</h1>
        <p className="text-muted-foreground mt-2">
          Search and book appointments with available doctors.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search doctors by name or specialty..."
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={doctor.avatar} alt={doctor.name} />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{doctor.name}</CardTitle>
                    <CardDescription>{doctor.specialty}</CardDescription>
                  </div>
                </div>
                {doctor.available && (
                  <Badge variant="default" className="bg-green-500">
                    Available
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">{doctor.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({doctor.reviews} reviews)
                </span>
              </div>
              <Button className="w-full" disabled={!doctor.available}>
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
