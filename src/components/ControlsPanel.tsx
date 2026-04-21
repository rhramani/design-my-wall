'use client';

import React from 'react';
import { Upload, X, Grid, RotateCcw, Box, Hash } from 'lucide-react';
import { TileSettings } from '@/types';

interface ControlsPanelProps {
  settings: TileSettings;
  setSettings: React.Dispatch<React.SetStateAction<TileSettings>>;
  onUpload: (type: 'wall' | 'tile', url: string | null) => void;
  onReset: () => void;
  wallImage: string | null;
  tileImage: string | null;
  onQuickDemo: () => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  setSettings,
  onUpload,
  onReset,
  wallImage,
  tileImage,
  onQuickDemo,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'wall' | 'tile') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload(type, url);
  };

  return (
    <aside className="w-full lg:w-80 bg-[#f9fafb] border-r border-[#e5e7eb] flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-6">
        {/* Logo Section */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Box className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">TileViz Pro</h1>
        </div>

        {/* Image Upload Area */}
        <div className="space-y-4">
          {/* Wall Image */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Wall Image</label>
            {!wallImage ? (
              <div 
                className="group border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-white transition-all"
                onClick={() => document.getElementById('wall-input')?.click()}
              >
                <Upload size={24} className="text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-gray-400 font-medium text-center uppercase tracking-tighter">Click to upload wall</p>
                <input id="wall-input" type="file" hidden onChange={(e) => handleFileChange(e, 'wall')} accept="image/*" />
              </div>
            ) : (
              <div className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <img src={wallImage} alt="Wall" className="w-full h-24 object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/50 to-transparent flex justify-end">
                   <button 
                    className="p-1.5 bg-white/90 hover:bg-white text-red-500 rounded-lg shadow-sm transition-all transform translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100" 
                    onClick={() => onUpload('wall', null)}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tile Texture */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tile Texture</label>
            {!tileImage ? (
              <div 
                className="group border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-white transition-all"
                onClick={() => document.getElementById('tile-input')?.click()}
              >
                <Grid size={24} className="text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-gray-400 font-medium text-center uppercase tracking-tighter">Choose pattern</p>
                <input id="tile-input" type="file" hidden onChange={(e) => handleFileChange(e, 'tile')} accept="image/*" />
              </div>
            ) : (
              <div className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <img src={tileImage} alt="Tile" className="w-full h-24 object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/50 to-transparent flex justify-end">
                  <button 
                    className="p-1.5 bg-white/90 hover:bg-white text-red-500 rounded-lg shadow-sm transition-all transform translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100" 
                    onClick={() => onUpload('tile', null)}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-200 my-4" />

        {/* Precision Controls */}
        <div className="space-y-5">
          {/* Tile Size */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 block">Tile Dimensions (px)</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input 
                  type="number" 
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Width" 
                  value={settings.tileSize.width}
                  onChange={(e) => setSettings({...settings, tileSize: {...settings.tileSize, width: parseInt(e.target.value) || 0}})}
                />
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Height" 
                  value={settings.tileSize.height}
                  onChange={(e) => setSettings({...settings, tileSize: {...settings.tileSize, height: parseInt(e.target.value) || 0}})}
                />
              </div>
            </div>
          </div>

          {/* Gaps */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-gray-600">Horizontal Gap</label>
                <span className="text-[10px] font-bold text-indigo-600">{settings.gap.horizontal}px</span>
              </div>
              <input 
                type="range" min="0" max="50" 
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={settings.gap.horizontal} 
                onChange={(e) => setSettings({...settings, gap: {...settings.gap, horizontal: parseInt(e.target.value)}})}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-gray-600">Vertical Gap</label>
                <span className="text-[10px] font-bold text-indigo-600">{settings.gap.vertical}px</span>
              </div>
              <input 
                type="range" min="0" max="50" 
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={settings.gap.vertical} 
                onChange={(e) => setSettings({...settings, gap: {...settings.gap, vertical: parseInt(e.target.value)}})}
              />
            </div>
          </div>

          {/* Gap Color */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600">Gap Color</label>
            <div className="flex gap-2">
              <div className="relative w-10 h-10 shrink-0">
                <input 
                  type="color" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  value={settings.gapColor} 
                  onChange={(e) => setSettings({...settings, gapColor: e.target.value})}
                />
                <div 
                  className="w-full h-full rounded-lg border border-gray-200 shadow-sm" 
                  style={{ backgroundColor: settings.gapColor }} 
                />
              </div>
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Hash size={12} />
                </div>
                <input 
                  type="text" 
                  className="w-full bg-white border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
                  value={settings.gapColor.replace('#', '')} 
                  onChange={(e) => setSettings({...settings, gapColor: '#' + e.target.value.replace('#', '')})}
                />
              </div>
            </div>
          </div>

          {/* Rotation & Opacity */}
          <div className="space-y-4">
             <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-gray-600">Rotation</label>
                <span className="text-[10px] font-bold text-indigo-600">{settings.rotation}°</span>
              </div>
              <input 
                type="range" min="0" max="360" 
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={settings.rotation} 
                onChange={(e) => setSettings({...settings, rotation: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-gray-600">Opacity</label>
                <span className="text-[10px] font-bold text-indigo-600">{Math.round(settings.opacity * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01"
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={settings.opacity} 
                onChange={(e) => setSettings({...settings, opacity: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          {/* Placement */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600">Placement</label>
            <select 
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer transition-all appearance-none"
              value={settings.placement}
              onChange={(e) => setSettings({...settings, placement: e.target.value as any})}
            >
              <option value="full">Full Wall</option>
              <option value="center">Center Area</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 flex flex-col gap-3">
          <button 
            className="w-full py-3 bg-white text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100 shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group" 
            onClick={onQuickDemo}
          >
            <span className="group-hover:rotate-12 transition-transform">✨</span> Quick Demo
          </button>
          <button 
            className="w-full py-3 bg-gray-100 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2" 
            onClick={onReset}
          >
            <RotateCcw size={14} /> Reset All
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ControlsPanel;
