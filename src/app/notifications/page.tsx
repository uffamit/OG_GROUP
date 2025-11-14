'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, Pill, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const notifications = {
  all: [
    {
      id: 1,
      type: 'appointment',
      title: 'Upcoming Appointment',
      message: 'Your appointment with Dr. Ben Carter is tomorrow at 10:30 AM',
      time: '2 hours ago',
      read: false,
      icon: Calendar,
      variant: 'default' as const,
    },
    {
      id: 2,
      type: 'medication',
      title: 'Medication Reminder',
      message: "Don't forget to take your Metformin at 8:00 PM",
      time: '5 hours ago',
      read: false,
      icon: Pill,
      variant: 'secondary' as const,
    },
    {
      id: 3,
      type: 'alert',
      title: 'Health Alert',
      message: 'Your blood pressure reading is slightly elevated. Please monitor closely.',
      time: '1 day ago',
      read: true,
      icon: AlertCircle,
      variant: 'destructive' as const,
    },
    {
      id: 4,
      type: 'appointment',
      title: 'Appointment Confirmed',
      message: 'Your appointment with Dr. Chloe Davis has been confirmed for July 25',
      time: '2 days ago',
      read: true,
      icon: CheckCircle2,
      variant: 'default' as const,
    },
  ],
};

export default function NotificationsPage() {
  const unreadCount = notifications.all.filter((n) => !n.read).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with your health alerts and reminders.
          </p>
        </div>
        <Button variant="outline">Mark All as Read</Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {notifications.all.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card
                key={notification.id}
                className={notification.read ? 'opacity-60' : ''}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      notification.variant === 'destructive'
                        ? 'bg-red-500/10 text-red-500'
                        : notification.variant === 'secondary'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-green-500/10 text-green-500'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{notification.title}</p>
                        {!notification.read && (
                          <Badge variant="default" className="bg-primary">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        {notification.time}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4 mt-6">
          {notifications.all
            .filter((n) => !n.read)
            .map((notification) => {
              const Icon = notification.icon;
              return (
                <Card key={notification.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${
                        notification.variant === 'destructive'
                          ? 'bg-red-500/10 text-red-500'
                          : notification.variant === 'secondary'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{notification.title}</p>
                          <Badge variant="default" className="bg-primary">
                            New
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3" />
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4 mt-6">
          {notifications.all
            .filter((n) => n.type === 'appointment')
            .map((notification) => {
              const Icon = notification.icon;
              return (
                <Card
                  key={notification.id}
                  className={notification.read ? 'opacity-60' : ''}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{notification.title}</p>
                          {!notification.read && (
                            <Badge variant="default" className="bg-primary">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3" />
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>

        <TabsContent value="medications" className="space-y-4 mt-6">
          {notifications.all
            .filter((n) => n.type === 'medication')
            .map((notification) => {
              const Icon = notification.icon;
              return (
                <Card
                  key={notification.id}
                  className={notification.read ? 'opacity-60' : ''}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{notification.title}</p>
                          {!notification.read && (
                            <Badge variant="default" className="bg-primary">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3" />
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
