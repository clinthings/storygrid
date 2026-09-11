import React from 'react';
import { Link } from 'react-router-dom';
import PublicFooter from './PublicFooter';

const options = [
    ['Homepage visibility', 'Top-of-page and between-section placements designed for high-quality reach.'],
    ['Article sponsorships', 'Contextual sponsorships around relevant editorial topics, clearly marked for readers.'],
    ['Newsletter placement', 'A considered slot in StoryGrid reader communications when the newsletter is enabled.'],
];

export default function AdvertisePage() {
    return <main className="public-page min-h-screen bg-[#f5f6f8] pb-16 pt-28 text-[#172033] dark:bg-[#050507] dark:text-white">
        <div className="mx-auto max-w-5xl px-5 sm:px-8"><Link to="/" className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">← StoryGrid</Link><header className="mt-8 max-w-3xl border-b border-slate-200 pb-10 dark:border-white/10"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">Media Kit</p><h1 className="mt-3 text-6xl font-black leading-none" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>Advertise with StoryGrid</h1><p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-white/60">Reach an engaged audience through thoughtful, clearly labelled placements across our editorial platform.</p></header><section className="grid gap-5 py-10 md:grid-cols-3">{options.map(([title, description]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none"><h2 className="text-lg font-black">{title}</h2><p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-white/50">{description}</p></article>)}</section><section className="max-w-2xl border-t border-slate-200 pt-8 dark:border-white/10"><h2 className="text-2xl font-black">Built for brand trust</h2><p className="mt-3 leading-relaxed text-slate-600 dark:text-white/55">StoryGrid keeps advertising separate from editorial decisions. Every sponsored story is identified, and ad placements are designed to support the reading experience rather than interrupt it.</p><a href="mailto:advertise@storygrid.example" className="mt-6 inline-flex rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950">Start a conversation</a></section></div><PublicFooter /></main>;
}
