'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types/notification';

interface UseNotificationsParams {
  userAddress: string;
  unreadOnly?: boolean;
  type?: string;
  priority?: string;
  limit?: number;
  autoRefresh?: boolean;
}

