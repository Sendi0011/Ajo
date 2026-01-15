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

  
}