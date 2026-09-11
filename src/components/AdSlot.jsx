import React from 'react';

export default function AdSlot({ label = 'Advertisement', variant = 'banner', className = '' }) {
    const adsEnabled = import.meta.env.VITE_ADS_ENABLED !== 'false';
    if (!adsEnabled) return null;

    const sizeClass = {
        banner: 'min-h-20',
        inArticle: 'min-h-24',
        sidebar: 'min-h-[250px]',
        footer: 'min-h-24',
    }[variant] || 'min-h-20';

    return (
        <aside className={`ad-slot ${sizeClass} flex w-full items-center justify-center border-y border-slate-200 bg-slate-50 px-4 py-5 transition-colors dark:border-white/10 dark:bg-white/[0.015] ${className}`} aria-label="Advertisement" data-ad-slot={variant}>
            <div className="text-center">
                <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-white/25">{label}</span>
                <span className="mt-1 block text-[10px] text-slate-400/80 dark:text-white/15">AdSense slot ready</span>
            </div>
        </aside>
    );
}
