import React from 'react';
import { Link } from 'react-router-dom';
import PublicFooter from './PublicFooter';

const sections = [
    {
        title: '1. Information We Collect',
        content: 'We collect information you provide directly to us when creating an account, leaving comments, or subscribing to newsletters. This may include your name, email address, and profile details.',
    },
    {
        title: '2. How We Use Information',
        content: 'We use collected data to display your comments, send optional notification updates about new posts, manage user permissions, and ensure site security.',
    },
    {
        title: '3. Cookies & Local Storage',
        content: 'We use essential browser local storage and session cookies to keep you signed in and save your preferences.',
    },
    {
        title: '4. Third-Party Services',
        content: 'We utilize Supabase for authentication, database management, and media storage. Your data is stored securely according to industry-standard encryption practices.',
    },
];

export default function PrivacyPolicyPage() {
    return (
        <main className="public-page min-h-screen bg-[#f5f6f8] pb-16 pt-28 text-[#172033] dark:bg-[#050507] dark:text-white">
            <div className="mx-auto max-w-4xl px-5 sm:px-8">
                <Link to="/" className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">← StoryGrid</Link>
                <header className="mt-8 border-b border-slate-200 pb-10 dark:border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">Legal</p>
                    <h1 className="mt-3 text-6xl font-black leading-none" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>Privacy Policy</h1>
                    <p className="mt-5 text-sm text-slate-500 dark:text-white/45">Last updated: September 2026</p>
                </header>
                <div className="max-w-2xl divide-y divide-slate-200 dark:divide-white/10">
                    {sections.map(({ title, content }) => (
                        <section key={title} className="py-8">
                            <h2 className="text-2xl font-black">{title}</h2>
                            <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-white/60">{content}</p>
                        </section>
                    ))}
                    <section className="py-8">
                        <h2 className="text-2xl font-black">5. Contact Us</h2>
                        <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-white/60">
                            If you have any questions about this policy, please contact us at{' '}
                            <a href="mailto:support@yourcustomdomain.com" className="font-semibold text-cyan-700 underline decoration-cyan-500/40 underline-offset-4 dark:text-cyan-300">support@yourcustomdomain.com</a>.
                        </p>
                    </section>
                </div>
            </div>
            <PublicFooter />
        </main>
    );
}