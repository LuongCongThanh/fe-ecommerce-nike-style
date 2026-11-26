'use client';

import { useMemo } from 'react';

export const useHomeFlashSaleCountdown = () => {
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    return d;
  }, []);
  return { targetDate };
};
