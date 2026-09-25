import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useReader } from '../lib/ReaderProvider';

export default function ReaderAuthModal({ onClose }) {
    const { signUp, signIn, resetPassword, enabled } = useReader();
    const [mode, setMode] = useState('signin');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const submit = async (event) => {
        event.preventDefault(); setMessage(''); setBusy(true);
        try {
            if (!enabled) throw new Error('Reader accounts are not configured yet. Add the Supabase environment variables to enable them.');
            if (mode === 'forgot') {
                if (!email.trim()) throw new Error('Email is required.');
                await resetPassword(email);
                setMessage('Check your inbox for a password reset link.');
                return;
            }
            if (mode === 'signup') {
                if (!username.trim()) throw new Error('Username is required.');
                if (!email.trim()) throw new Error('Email is required.');
                if (!password) throw new Error('Password is required.');
                if (password !== confirmPassword) throw new Error('Passwords do not match.');

                const data = await signUp({ email, password, displayName: username });
                if (data?.session) {
                    onClose();
                    return;
                }

                setMessage('Account created. Check your inbox if email confirmation is enabled.');
                return;
            }

            if (!email.trim()) throw new Error('Email is required.');
            if (!password) throw new Error('Password is required.');
            await signIn(email, password);
            onClose();
        } catch (error) {
            setMessage(error.message || 'Registration failed. Please try again.');
        } finally {
            setBusy(false);
        }
    };
    return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d12] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">StoryGrid Readers</p><h2 className="mt-1 text-2xl font-black text-white">{mode === 'signup' ? 'Create Reader Account' : mode === 'forgot' ? 'Reset Password' : 'Join the Conversation'}</h2></div><button type="button" onClick={onClose} aria-label="Close"><X size={20} className="text-white/50" /></button></div>
            <form className="space-y-4" onSubmit={submit}>
                {mode === 'signup' && <input required minLength={2} maxLength={80} value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />}
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                {mode !== 'forgot' && <input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />}
                {mode === 'signup' && mode !== 'forgot' && <input required minLength={8} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />}
                {message && <p className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-200">{message}</p>}
                <button disabled={busy} className="w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-black disabled:opacity-50">{busy ? 'Working...' : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In'}</button>
            </form>
            <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/45">{mode !== 'signin' && <button type="button" onClick={() => setMode('signin')}>Sign in</button>}{mode !== 'signup' && <button type="button" onClick={() => setMode('signup')}>Create account</button>}{mode !== 'forgot' && <button type="button" onClick={() => setMode('forgot')}>Forgot password?</button>}</div>
        </div>
    </div>;
}
