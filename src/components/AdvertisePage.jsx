import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicFooter from './PublicFooter';

const options = [
    ['Homepage visibility', 'Top-of-page and between-section placements designed for high-quality reach.'],
    ['Article sponsorships', 'Contextual sponsorships around relevant editorial topics, clearly marked for readers.'],
    ['Newsletter placement', 'A considered slot in StoryGrid reader communications when the newsletter is enabled.'],
];

export default function AdvertisePage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        company: '',
        message: '',
    });
    const [files, setFiles] = useState([]);

    const filePreview = useMemo(
        () => files.map((file) => ({ name: file.name, type: file.type, url: URL.createObjectURL(file) })),
        [files]
    );

    const handleSubmit = (event) => {
        event.preventDefault();

        const subject = encodeURIComponent(`Advertising enquiry from ${form.name || 'new partner'}`);
        const body = encodeURIComponent(
            [
                `Name: ${form.name || 'Not provided'}`,
                `Email: ${form.email || 'Not provided'}`,
                `Company: ${form.company || 'Not provided'}`,
                '',
                'Message:',
                form.message || 'No message provided.',
                '',
                files.length ? `Attachments: ${files.map((file) => file.name).join(', ')}` : '',
            ].join('\n')
        );

        window.location.href = `mailto:advertise@storygrid.example?subject=${subject}&body=${body}`;
    };

    return <main className="public-page min-h-screen bg-[#f5f6f8] pb-16 pt-28 text-[#172033] dark:bg-[#050507] dark:text-white">
        <div className="mx-auto max-w-5xl px-5 sm:px-8"><Link to="/" className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">← StoryGrid</Link><header className="mt-8 max-w-3xl border-b border-slate-200 pb-10 dark:border-white/10"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">Media Kit</p><h1 className="mt-3 text-6xl font-black leading-none" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>Advertise with StoryGrid</h1><p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-white/60">Reach an engaged audience through thoughtful, clearly labelled placements across our editorial platform.</p></header><section className="grid gap-5 py-10 md:grid-cols-3">{options.map(([title, description]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none"><h2 className="text-lg font-black">{title}</h2><p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-white/50">{description}</p></article>)}</section><section className="max-w-3xl border-t border-slate-200 pt-8 dark:border-white/10"><h2 className="text-2xl font-black">Built for brand trust</h2><p className="mt-3 leading-relaxed text-slate-600 dark:text-white/55">StoryGrid keeps advertising separate from editorial decisions. Every sponsored story is identified, and ad placements are designed to support the reading experience rather than interrupt it.</p>

            <form onSubmit={handleSubmit} className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                        <span className="mb-2 block">Your name</span>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                            placeholder="Jane Smith"
                        />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                        <span className="mb-2 block">Email</span>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                            placeholder="you@brand.com"
                            required
                        />
                    </label>
                </div>

                <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    <span className="mb-2 block">Company or brand</span>
                    <input
                        type="text"
                        value={form.company}
                        onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        placeholder="Brand name"
                    />
                </label>

                <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    <span className="mb-2 block">Message</span>
                    <textarea
                        value={form.message}
                        onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                        className="min-h-[170px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        placeholder="Tell us about your campaign, budget, timeline, and goals..."
                        required
                    />
                </label>

                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                        <span>Add image or video</span>
                        <span className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950">Choose files</span>
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={(event) => setFiles(Array.from(event.target.files || []))}
                            className="hidden"
                        />
                    </label>

                    {filePreview.length > 0 && (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {filePreview.map((file) => (
                                <div key={`${file.name}-${file.type}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b0f17]">
                                    {file.type.startsWith('video/') ? (
                                        <video src={file.url} controls className="h-28 w-full object-cover" />
                                    ) : (
                                        <img src={file.url} alt={file.name} className="h-28 w-full object-cover" />
                                    )}
                                    <p className="truncate px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{file.name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" className="mt-6 inline-flex rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:bg-cyan-300">
                    Send message
                </button>
            </form>
        </section></div><PublicFooter /></main>;
}
