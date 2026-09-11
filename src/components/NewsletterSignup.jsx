import React, { useState } from 'react';
import { saveNotificationSubscription } from '../lib/reader';
import { useReader } from '../lib/ReaderProvider';

export default function NewsletterSignup() {
    const { user } = useReader();
    const [email, setEmail] = useState(user?.email || '');
    const [consent, setConsent] = useState(false);
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const submit = async (event) => { event.preventDefault(); if (!consent) { setMessage('Please opt in to receive new story notifications.'); return; } setBusy(true); try { await saveNotificationSubscription({ email, userId: user?.id, enabled: true }); setMessage('You are on the StoryGrid list.'); setEmail(''); } catch (error) { setMessage(error.message.includes('duplicate') ? 'That email is already subscribed.' : error.message); } finally { setBusy(false); } };
    return <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-10"><div className="rounded-[26px] border border-cyan-400/20 bg-cyan-400/[0.06] p-6 sm:p-10"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Stay in the Story</p><div className="mt-2 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><h2 className="text-3xl font-black text-white" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>New stories, when they matter.</h2><p className="mt-2 text-sm text-white/55">Get new StoryGrid stories delivered to your inbox.</p></div><form onSubmit={submit} className="w-full max-w-xl"><div className="flex flex-col gap-2 sm:flex-row"><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none" /><button disabled={busy} className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-black disabled:opacity-50">{busy ? 'Saving...' : 'Notify Me'}</button></div><label className="mt-3 flex items-start gap-2 text-xs text-white/50"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5" /> Yes, email me when StoryGrid publishes new articles.</label>{message && <p className="mt-3 text-sm text-cyan-200">{message}</p>}</form></div></div></section>;
}
