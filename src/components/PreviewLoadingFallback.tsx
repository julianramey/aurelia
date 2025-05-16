import React from 'react';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline';

const PreviewLoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 bg-slate-100">
    <Bars3BottomLeftIcon className="w-6 h-6 text-slate-400 animate-pulse mr-2"/>Loading Preview...
  </div>
);

export default PreviewLoadingFallback; 