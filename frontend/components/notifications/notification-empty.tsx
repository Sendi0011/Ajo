'use client';

import { Bell } from 'lucide-react';

export function NotificationEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
        <Bell className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No notifications</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        You're all caught up! We'll notify you when there's something new.
      </p>
    </div>
  );
}