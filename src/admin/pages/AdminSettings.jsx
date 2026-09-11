// src/admin/pages/AdminSettings.jsx
import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function AdminSettings() {
    const [saved, setSaved] = useState(false);
    const [siteName, setSiteName] = useState(localStorage.getItem('sg_site_name') || 'STORYGRID');
    const [siteTagline, setSiteTagline] = useState(localStorage.getItem('sg_site_tagline') || 'Premium Editorial Platform');

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('sg_site_name', siteName);
        localStorage.setItem('sg_site_tagline', siteTagline);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="max-w-xl">
            <h1 className="text-4xl font-black tracking-tighter mb-8" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>Settings</h1>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="rounded-2xl p-6 space-y-5"
                    style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Site Identity</h2>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-2">Site Name</label>
                        <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f5' }} />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-2">Site Tagline</label>
                        <input type="text" value={siteTagline} onChange={e => setSiteTagline(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f5' }} />
                    </div>
                </div>

                <div className="rounded-2xl p-6 space-y-4"
                    style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Authentication</h2>
                    <p className="text-xs text-white/30">Production admin access is managed through Supabase Auth and the profiles table. Do not store admin credentials in browser code.</p>
                    <div className="p-4 rounded-xl text-xs font-mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                        Supabase Auth + profiles.role = admin/editor
                    </div>
                </div>

                <button type="submit"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                    style={{ background: saved ? '#34d399' : '#22d3ee', color: '#000' }}>
                    {saved ? <><Check size={16} />Saved!</> : 'Save Settings'}
                </button>
            </form>
        </div>
    );
}
