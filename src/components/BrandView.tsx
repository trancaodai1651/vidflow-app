import React from 'react';
import { Layers } from 'lucide-react';

export default function BrandView() {
  return (
    <div className="h-full w-full flex items-center justify-center flex-col text-gray-500 bg-black/10">
      <Layers size={70} className="mb-4 opacity-10 animate-pulse" />
      <h2 className="text-2xl font-black text-gray-300 mb-1">Brand Kits Workspace</h2>
      <p className="text-sm opacity-60">Không gian thiết lập Logo đè và Nhạc nền tự động đang được thiết lập.</p>
    </div>
  );
}