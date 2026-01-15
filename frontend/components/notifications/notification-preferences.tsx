'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { toast } from 'sonner';
import { Bell, Mail, Smartphone, Volume2, Moon } from 'lucide-react';

interface NotificationPreferencesProps {
  userAddress: string;
}

export function NotificationPreferences({ userAddress }: NotificationPreferencesProps) {
  const { preferences, loading, updatePreferences } = useNotificationPreferences(userAddress);
  const [localPrefs, setLocalPrefs] = useState<any>({});

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    await updatePreferences(localPrefs);
    toast.success('Preferences saved successfully');
  };

  if (loading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage how you receive notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* In-App Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>In-App Notifications</CardTitle>
            </div>
            <CardDescription>
              Control notifications within the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="inapp-enabled">Enable in-app notifications</Label>
              <Switch
                id="inapp-enabled"
                checked={localPrefs.inapp_enabled}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, inapp_enabled: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-badge">Show unread badge</Label>
              <Switch
                id="show-badge"
                checked={localPrefs.inapp_show_badge}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, inapp_show_badge: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="play-sound">Play notification sound</Label>
              <Switch
                id="play-sound"
                checked={localPrefs.inapp_play_sound}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, inapp_play_sound: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="group-similar">Group similar notifications</Label>
              <Switch
                id="group-similar"
                checked={localPrefs.inapp_group_similar}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, inapp_group_similar: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Email Notifications</CardTitle>
            </div>
            <CardDescription>
              Receive notifications via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-enabled">Enable email notifications</Label>
              <Switch
                id="email-enabled"
                checked={localPrefs.email_enabled}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, email_enabled: checked })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-digest">Email digest frequency</Label>
              <Select
                value={localPrefs.email_digest}
                onValueChange={(value) =>
                  setLocalPrefs({ ...localPrefs, email_digest: value })
                }
              >
                <SelectTrigger id="email-digest">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                  <SelectItem value="REALTIME">Real-time (instant)</SelectItem>
                  <SelectItem value="DAILY">Daily digest</SelectItem>
                  <SelectItem value="WEEKLY">Weekly digest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {localPrefs.email_digest === 'DAILY' && (
              <div className="space-y-2">
                <Label htmlFor="digest-time">Send digest at</Label>
                <Input
                  id="digest-time"
                  type="time"
                  value={localPrefs.email_digest_time}
                  onChange={(e) =>
                    setLocalPrefs({ ...localPrefs, email_digest_time: e.target.value })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <CardTitle>Push Notifications</CardTitle>
            </div>
            <CardDescription>
              Receive push notifications on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-enabled">Enable push notifications</Label>
              <Switch
                id="push-enabled"
                checked={localPrefs.push_enabled}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, push_enabled: checked })
                }
              />
            </div>
            {localPrefs.push_enabled && (
              <Button variant="outline" size="sm">
                Test Push Notification
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              <CardTitle>Quiet Hours</CardTitle>
            </div>
            <CardDescription>
              Pause non-urgent notifications during specific hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-enabled">Enable quiet hours</Label>
              <Switch
                id="quiet-enabled"
                checked={localPrefs.quiet_hours_enabled}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, quiet_hours_enabled: checked })
                }
              />
            </div>

            {localPrefs.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Start time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={localPrefs.quiet_hours_start}
                    onChange={(e) =>
                      setLocalPrefs({ ...localPrefs, quiet_hours_start: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">End time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={localPrefs.quiet_hours_end}
                    onChange={(e) =>
                      setLocalPrefs({ ...localPrefs, quiet_hours_end: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}