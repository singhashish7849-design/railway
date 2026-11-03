'use client';

import React from 'react';
import { WindowView } from '@/components/window-view/WindowView';

interface PageProps {
  params: {
    id: string;
  };
}

export default function TrainWindowViewPage({ params }: PageProps) {
  return <WindowView trainNumber={params.id} />;
}
