'use client';

import React, { useState, useCallback, useRef } from 'react';
import TileCanvas from '@/components/TileCanvas';
import ControlsPanel from '@/components/ControlsPanel';
import { TileSettings } from '@/types';

const DEFAULT_SETTINGS: TileSettings = {
  gap: { horizontal: 2, vertical: 2 },
  gapColor: '#ffffff',
  tileSize: { width: 100, height: 100 },
  placement: 'full',
  rotation: 0,
  opacity: 0.8,
};

export default function Home() {
  const [wallImage, setWallImage] = useState<string | null>(null);
  const [tileImage, setTileImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<TileSettings>(DEFAULT_SETTINGS);

  const handleUpload = useCallback((type: 'wall' | 'tile', url: string | null) => {
    if (type === 'wall') setWallImage(url);
    else setTileImage(url);
  }, []);

  const handleQuickDemo = () => {
    setWallImage('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop');
    setTileImage('https://images.unsplash.com/photo-1615529328331-f8917597711f?q=80&w=500&auto=format&fit=crop');
    setSettings({
      ...DEFAULT_SETTINGS,
      rotation: 0,
    });
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setWallImage(null);
    setTileImage(null);
  };

  return (
    <main className="flex h-screen bg-white overflow-hidden font-sans antialiased text-gray-900">
      <ControlsPanel
        settings={settings}
        setSettings={setSettings}
        onUpload={handleUpload}
        onReset={handleReset}
        wallImage={wallImage}
        tileImage={tileImage}
        onQuickDemo={handleQuickDemo}
      />
      
      <section className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 overflow-hidden">
        <TileCanvas
          wallImage={wallImage}
          tileImage={tileImage}
          settings={settings}
        />
      </section>
    </main>
  );
}
