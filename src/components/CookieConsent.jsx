import React, { useEffect, useState } from 'react';

const KEY = 'storygrid_cookie_consent';
export default function CookieConsent() {
    const [choice, setChoice] = useState(() => localStorage.getItem(KEY));
    const [manage, setManage] = useState(false);
    useEffect(() => { if (choice) localStorage.setItem(KEY, choice); }, [choice]);
    if (choice && !manage) return <button type="button" onClick={() => setManage(true)} className="fixed bottom-4 left-4 z-40 rounded-full border border-white/10 bg-[#0d0d12] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/50">Privacy settings</button>;
    return <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#0d0d12]/95 p-5 shadow-2xl backdrop-blur"><p className="text-sm leading-relaxed text-white/70">We use cookies and similar technologies to improve your experience and remember your preferences.</p>{manage && <div className="mt-4 border-t border-white/10 pt-4 text-xs text-white/50"><p>Essential functionality is always enabled. Analytics and advertising cookies are not enabled by this site.</p></div>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => { setChoice('accepted'); setManage(false); }} className="rounded-xl bg-cyan-300 px-4 py-2 text-xs font-black text-black">Accept</button><button type="button" onClick={() => { setChoice('declined'); setManage(false); }} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/70">Decline</button><button type="button" onClick={() => setManage(true)} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/70">Manage Preferences</button></div></div>;
}
