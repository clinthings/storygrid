import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useReader } from '../lib/ReaderProvider';
import { saveNotificationSubscription } from '../lib/reader';
import ReaderAuthModal from './ReaderAuthModal';

export default function AccountPage() {
    const { user, profile, subscription, updateProfile, signOut, loading } = useReader();
    const [displayName, setDisplayName] = useState('');
    const [enabled, setEnabled] = useState(false);
    const [message, setMessage] = useState('');
    const [authOpen, setAuthOpen] = useState(false);
    // The profile arrives asynchronously after Supabase restores the session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setDisplayName(profile?.display_name || ''); setEnabled(Boolean(subscription?.subscribed_to_new_posts)); }, [profile, subscription]);
    if (loading) return <main className="min-h-screen pt-32 text-center text-white/50">Loading account...</main>;
    if (!user) return <main className="min-h-screen px-6 pt-32 text-center"><h1 className="text-4xl font-black text-white">Your StoryGrid account</h1><p className="mt-3 text-white/50">Sign in to manage your profile and notification preferences.</p><button type="button" onClick={() => setAuthOpen(true)} className="mt-6 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-black">Sign in</button>{authOpen && <ReaderAuthModal onClose={() => setAuthOpen(false)} />}</main>;
    const save = async (event) => { event.preventDefault(); try { await updateProfile(displayName); await saveNotificationSubscription({ email: user.email, userId: user.id, enabled }); setMessage('Preferences saved.'); } catch (error) { setMessage(error.message); } };
    return <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6"><div className="mx-auto max-w-2xl"><Link to="/" className="text-sm text-cyan-300">← Back to StoryGrid</Link><h1 className="mt-5 text-5xl font-black text-white" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>My Profile</h1><form onSubmit={save} className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6"><div><label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/40">Display Name</label><input required minLength={2} maxLength={80} value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" /></div><div><label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/40">Email</label><input disabled value={user.email || ''} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white/40 outline-none" /></div><label className="flex items-center gap-3 text-sm text-white/70"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} /> Email me when StoryGrid publishes a new article</label>{message && <p className="text-sm text-cyan-200">{message}</p>}<div className="flex flex-wrap gap-3"><button className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-black">Save Preferences</button><button type="button" onClick={() => signOut()} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white/60">Sign Out</button></div></form></div></main>;
}
