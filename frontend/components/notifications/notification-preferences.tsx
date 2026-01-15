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

        
      </div>
    </div>
  );
}