import React, { useEffect, useState } from 'react';
import { createComment, getApprovedComments, getCommentPreference } from '../lib/reader';
import { useReader } from '../lib/ReaderProvider';
import ReaderAuthModal from './ReaderAuthModal';

export default function CommentsSection({ postId }) {
    const { user, profile, enabled } = useReader();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [notify, setNotify] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [displayName, setDisplayName] = useState('');
    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const nextComments = await getApprovedComments(postId);
                const nextNotify = user ? await getCommentPreference(postId, user.id) : false;
                if (active) { setComments(nextComments); setNotify(nextNotify); }
            } catch (error) { if (active) setMessage(error.message); }
        };
        load();
        return () => { active = false; };
    }, [postId, user]);
    const submit = async (event) => { event.preventDefault(); try { await createComment({ postId, userId: user?.id, displayName: profile?.display_name || displayName, content, notify }); setContent(''); setMessage('Your comment is awaiting moderation.'); } catch (error) { setMessage(error.message); } };
    const commentAuthorName = profile?.display_name || 'Reader';
    return <section className="mt-16 border-t border-slate-200 pt-10" aria-labelledby="comments-heading">
        <div className="mb-8"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-600">Community</p><h2 id="comments-heading" className="mt-2 text-3xl font-black text-[#111827]" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>Join the Conversation</h2><p className="mt-2 text-sm text-slate-500">Have something to say about this story?</p></div>
        {!user && enabled ? <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6"><p className="mb-4 text-sm text-slate-600">Create a reader account to take part in the conversation.</p><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setAuthOpen(true)} className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-black text-slate-950">Sign in to comment</button><button type="button" onClick={() => setAuthOpen(true)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600">Create Reader Account</button></div></div> : <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="mb-3 text-sm font-semibold text-slate-700">{user ? `Commenting as ${commentAuthorName}` : 'Leave a comment'}</p>{!user && <input required minLength={2} maxLength={80} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display name" className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none" />}<textarea required maxLength={2000} value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="Write your comment..." className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800 outline-none" /><div className="mt-4 flex flex-wrap items-center justify-between gap-4"><label className="flex items-center gap-2 text-xs text-slate-500"><input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} /> Notify me about new comments on this article</label><button className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-black text-slate-950">Post Comment</button></div></form>}
        {message && <p className="mt-4 text-sm text-cyan-700">{message}</p>}
        <div className="mt-8 space-y-5">{comments.length === 0 ? <p className="text-sm text-slate-500">Be the first to join the conversation.</p> : comments.map(comment => <article key={comment.id} className="border-b border-slate-200 pb-5"><div className="flex items-center justify-between gap-3"><strong className="text-sm text-slate-800">{comment.author_display_name || 'Reader'}</strong><time className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{comment.content}</p></article>)}</div>
        {authOpen && <ReaderAuthModal onClose={() => setAuthOpen(false)} />}
    </section>;
}
