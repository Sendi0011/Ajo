'use client';

import { useEffect, useRef } from 'react';

const SOUNDS = {
  default: '/sounds/notification.mp3',
  payment: '/sounds/payment.mp3',
  achievement: '/sounds/achievement.mp3',
  urgent: '/sounds/urgent.mp3',
};

export function useNotificationSound(enabled: boolean = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
    }
  }, []);

  const play = (type: 'default' | 'payment' | 'achievement' | 'urgent' = 'default') => {
    if (!enabled || !audioRef.current) return;

    audioRef.current.src = SOUNDS[type];
    audioRef.current.play().catch((err) => {
      console.error('Failed to play notification sound:', err);
    });
  };

  return { play };
}