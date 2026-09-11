// src/admin/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCms } from '../../lib/useCms';
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function AdminLogin() {
    const { login } = useCms();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const ok = await login(email, pass);
            if (ok) {
                navigate('/admin');
                return;
            }
            setError('This account is not authorized for administrator access.');
        } catch (submitError) {
            setError(submitError?.message || 'Sign in failed. Please verify your Supabase configuration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
            style={{ background: '#050507' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center gap-4 justify-center mb-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #22d3ee, #a855f7)' }}>
                        <Zap size={24} fill="white" color="white" />
                    </div>
                    <p className="text-4xl font-black"
                        style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', letterSpacing: '-0.02em' }}>
                        <span className="text-white">STORY</span><span style={{ color: '#22d3ee' }}>GRID</span>
                    </p>
                </div>

                <div className="rounded-2xl p-8"
                    style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
                    <p className="text-white/50 text-sm mb-8">Sign in to manage your CMS.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                                Admin Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#f0f0f5',
                                }}
                                placeholder="admin@storygrid.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={pass}
                                    onChange={e => setPass(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm font-medium focus:outline-none transition-all"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#f0f0f5',
                                    }}
                                    placeholder="••••••••"
                                    required
                                />
                                <button type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                    onClick={() => setShowPass(s => !s)}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                <AlertCircle size={15} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold text-sm transition-all"
                            style={{ background: loading ? '#888' : '#22d3ee', color: '#000' }}>
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-white/30 mt-6">
                        Use your Supabase admin or editor account.
                        <br />Admin access is managed in Supabase Auth and the profiles table.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
