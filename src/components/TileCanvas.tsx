'use client';

import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Download, ZoomIn, ZoomOut, Maximize, Loader2 } from 'lucide-react';
import { TileSettings } from '@/types';

interface TileCanvasProps {
  wallImage: string | null;
  tileImage: string | null;
  settings: TileSettings;
}

export interface TileCanvasRef {
  download: () => void;
  resetView: () => void;
  setZoom: (scale: number | ((s: number) => number)) => void;
}

const TileCanvas = forwardRef<TileCanvasRef, TileCanvasProps>(({
  wallImage,
  tileImage,
  settings,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wallImgRef = useRef<HTMLImageElement | null>(null);
  const tileImgRef = useRef<HTMLImageElement | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [imagesReady, setImagesReady] = useState({ wall: false, tile: false });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    download: handleDownload,
    resetView: () => { setScale(1); setOffset({ x: 0, y: 0 }); },
    setZoom: setScale,
  }));

  // Load Wall Image
  useEffect(() => {
    if (!wallImage) {
      wallImgRef.current = null;
      setImagesReady(prev => ({ ...prev, wall: false }));
      return;
    }

    setLoading(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = wallImage;
    img.onload = () => {
      wallImgRef.current = img;
      setImagesReady(prev => ({ ...prev, wall: true }));
      setLoading(false);
    };
    img.onerror = () => {
      setLoading(false);
      console.error("Failed to load wall image");
    };
  }, [wallImage]);

  // Load Tile Image
  useEffect(() => {
    if (!tileImage) {
      tileImgRef.current = null;
      setImagesReady(prev => ({ ...prev, tile: false }));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = tileImage;
    img.onload = () => {
      tileImgRef.current = img;
      setImagesReady(prev => ({ ...prev, tile: true }));
    };
  }, [tileImage]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!wallImgRef.current) {
      ctx.fillStyle = '#64748b';
      ctx.font = '500 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload a wall image to begin visualization', canvas.width / 2, canvas.height / 2);
      return;
    }

    const wallImg = wallImgRef.current;
    const ratio = Math.min(canvas.width / wallImg.width, canvas.height / wallImg.height) * 0.9;
    const w = wallImg.width * ratio * scale;
    const h = wallImg.height * ratio * scale;
    const x = (canvas.width - w) / 2 + offset.x;
    const y = (canvas.height - h) / 2 + offset.y;

    // 1. Draw Wall Image
    ctx.save();
    ctx.drawImage(wallImg, x, y, w, h);

    // 2. Draw Tiles if ready
    if (tileImgRef.current && imagesReady.tile) {
      const tileImg = tileImgRef.current;
      ctx.globalAlpha = settings.opacity;
      
      let startX = x;
      let startY = y;
      let gridW = w;
      let gridH = h;

      if (settings.placement === 'center') {
        gridW = Math.min(w * 0.7, 400 * scale);
        gridH = Math.min(h * 0.7, 400 * scale);
        startX = x + (w - gridW) / 2;
        startY = y + (h - gridH) / 2;
      }

      const tW = Math.round(Math.max(settings.tileSize.width * ratio * scale, 1));
      const tH = Math.round(Math.max(settings.tileSize.height * ratio * scale, 1));
      const gapX = Math.round(settings.gap.horizontal * ratio * scale);
      const gapY = Math.round(settings.gap.vertical * ratio * scale);

      const stepX = tW + gapX;
      const stepY = tH + gapY;

      ctx.save();
      // Floor/Ceil to ensure we cover the entire area without sub-pixel gaps
      const sX = Math.floor(startX);
      const sY = Math.floor(startY);
      const gW = Math.ceil(gridW);
      const gH = Math.ceil(gridH);
      
      // 1. Clip to the grid area
      ctx.beginPath();
      ctx.rect(sX, sY, gW, gH);
      ctx.clip();

      // 2. Draw the gap color only in the gap areas (grout)
      if (gapX > 0 || gapY > 0) {
        ctx.fillStyle = settings.gapColor;
        ctx.beginPath();
        
        // Vertical gaps
        if (gapX > 0) {
          for (let currX = sX; currX + tW < sX + gW; currX += stepX) {
            ctx.rect(Math.round(currX + tW), sY, gapX, gH);
          }
        }
        
        // Horizontal gaps
        if (gapY > 0) {
          for (let currY = sY; currY + tH < sY + gH; currY += stepY) {
            ctx.rect(sX, Math.round(currY + tH), gW, gapY);
          }
        }
        ctx.fill();
      }

      // 3. Draw Tiles
      for (let currY = sY; currY < sY + gH; currY += stepY) {
        for (let currX = sX; currX < sX + gW; currX += stepX) {
          // Draw tile with rotation
          if (settings.rotation !== 0) {
            ctx.save();
            ctx.translate(currX + tW / 2, currY + tH / 2);
            ctx.rotate((settings.rotation * Math.PI) / 180);
            ctx.drawImage(tileImg, -tW / 2, -tH / 2, tW, tH);
            ctx.restore();
          } else {
            // Draw tile at integer coordinates to prevent blurring
            ctx.drawImage(tileImg, Math.round(currX), Math.round(currY), tW, tH);
          }
        }
      }
      ctx.restore();
    }
    ctx.restore();
  }, [imagesReady, settings, scale, offset]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `tile-design-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#f3f4f6] relative overflow-hidden gap-6">
      <div className="relative group flex items-center justify-center">
        <canvas 
          ref={canvasRef} 
          width={1200} 
          height={800} 
          className={`bg-white shadow-2xl rounded-xl max-w-full max-h-full w-auto h-auto object-contain ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl z-10 transition-opacity">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        )}
      </div>

      {/* Action Controls - Now positioned below the image */}
      <div className="flex items-center gap-2 p-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 z-20">
        <div className="flex items-center px-2">
          <button 
            className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors text-gray-600" 
            onClick={() => setScale(s => Math.min(s + 0.1, 3))} 
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button 
            className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors text-gray-600" 
            onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} 
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
        </div>
        <div className="w-[1px] h-6 bg-gray-300 mx-3" />
        <button 
          className="px-6 py-2.5 cursor-pointer bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
          onClick={handleDownload}
          disabled={!imagesReady.wall}
        >
          <Download size={18} /> Download
        </button>
      </div>
    </div>
  );
});

TileCanvas.displayName = 'TileCanvas';

export default TileCanvas;
