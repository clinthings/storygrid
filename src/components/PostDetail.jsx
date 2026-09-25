// src/components/PostDetail.jsx — CMS-aware public article page
import React, { useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowLeft, Clock, Share2, Calendar, User, Link2, Facebook, Linkedin, Send, MessageCircle } from 'lucide-react';

import BlogPostCard from './BlogPostCard';
import { calcReadingTime } from '../lib/storage';
import CommentsSection from './CommentsSection';
import AdSlot from './AdSlot';
import NewsletterSignup from './NewsletterSignup';

const CAT_COLORS = {
    Technology: { text: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)' },
    Education: { text: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.3)' },
    Business: { text: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
    Productivity: { text: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)' },
    Future: { text: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const PostDetail = ({ post, onBack, onPostClick, publishedPosts = [], categories = [] }) => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [post?.id]);

    if (!post) return null;

    const catName = post.category || categories.find(category => category.id === post.categoryId)?.name || 'Story';
    const colors = CAT_COLORS[catName] || { text: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)' };
    const readTime = calcReadingTime(post.content);
    const relatedPosts = publishedPosts
        .filter(p => p.id !== post.id && (p.categoryId === post.categoryId || p.category === post.category))
        .slice(0, 3);

    const articleUrl = window.location.href;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: post.title, text: post.excerpt, url: articleUrl });
        } else {
            navigator.clipboard.writeText(articleUrl);
        }
    };

    const openShare = (url) => window.open(url, '_blank', 'noopener,noreferrer,width=680,height=560');
    const shareText = encodeURIComponent(`${post.title} | StoryGrid`);
    const encodedUrl = encodeURIComponent(articleUrl);

    return (
        <Motion.article className="article-page min-h-screen bg-[#f5f6f8] text-[#171923]" initial="hidden" animate="show" variants={stagger}>
            {/* ── Hero Image ── */}
            <div className="relative w-full overflow-hidden" style={{ height: 'clamp(300px, 55vh, 600px)' }}>
                <Motion.img
                    src={post.featuredImage || post.imageUrl}
                    alt={post.imageAlt || post.title}
                    width="1600"
                    height="900"
                    className="w-full h-full object-cover"
                    fetchPriority="high"
                    decoding="async"
                    variants={{ hidden: { scale: 1.08 }, show: { scale: 1 } }}
                    transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(5,5,7,0.95) 0%, rgba(5,5,7,0.5) 40%, rgba(5,5,7,0.2) 100%)' }} />

                {/* Back button */}
                <Motion.button
                    onClick={onBack}
                    variants={fadeUp}
                    className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors z-10"
                    style={{ background: 'rgba(5,5,7,0.6)', backdropFilter: 'blur(12px)', padding: '10px 18px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <ArrowLeft size={16} />Back
                </Motion.button>
            </div>

            {/* ── Article Header ── */}
            <div className="relative z-10 mx-auto -mt-24 max-w-4xl px-4 pb-16 sm:px-6">
                <div className="article-paper rounded-[24px] bg-white px-5 py-8 shadow-[0_20px_70px_rgba(15,23,42,0.16)] sm:px-10 sm:py-12 lg:px-16">
                {/* Category badge */}
                <Motion.div variants={fadeUp} className="mb-5">
                    {post.isSponsored && <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-amber-600">Sponsored content</p>}
                    <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full"
                        style={{ color: colors.text, background: colors.bg, border: `1px solid ${colors.border}` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.text }} />
                        {catName}
                    </span>
                </Motion.div>

                {/* Title */}
                <Motion.h1 variants={fadeUp} className="mb-6 font-black leading-[0.98] text-[#111827]"
                    style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 'clamp(2.7rem, 6vw, 5.2rem)', letterSpacing: '-0.03em' }}>
                    {post.title}
                </Motion.h1>

                {/* Excerpt */}
                {post.excerpt && (
                    <Motion.p variants={fadeUp} className="mb-8 text-lg leading-relaxed text-[#5b6472] sm:text-xl"
                        style={{ fontFamily: '"Inter", sans-serif' }}>
                        {post.excerpt}
                    </Motion.p>
                )}

                {/* Meta bar */}
                <Motion.div variants={fadeUp}
                    className="mb-10 flex flex-wrap items-center gap-4 border-b border-slate-200 pb-8 text-sm">
                    <span className="flex items-center gap-2 font-semibold text-[#273142]">
                        <User size={14} className="text-cyan-500" />
                        {post.author || 'Editorial Desk'}
                    </span>
                    <span className="text-slate-300">|</span>
                    {post.publishedAt && (
                        <span className="flex items-center gap-2 text-[#697386]">
                            <Calendar size={14} className="text-cyan-500" />
                            {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    )}
                    <span className="flex items-center gap-2 text-[#697386]">
                        <Clock size={14} className="text-cyan-500" />
                        {readTime}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                        <button onClick={handleShare} aria-label="Copy article link" title="Copy article link" className="rounded-xl border border-slate-200 p-2 text-[#697386] transition-colors hover:border-cyan-300 hover:text-cyan-600"><Link2 size={15} /></button>
                        <button onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`)} aria-label="Share on Facebook" title="Share on Facebook" className="rounded-xl border border-slate-200 p-2 text-[#697386] transition-colors hover:border-cyan-300 hover:text-cyan-600"><Facebook size={15} /></button>
                        <button onClick={() => openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`)} aria-label="Share on LinkedIn" title="Share on LinkedIn" className="rounded-xl border border-slate-200 p-2 text-[#697386] transition-colors hover:border-cyan-300 hover:text-cyan-600"><Linkedin size={15} /></button>
                        <button onClick={() => openShare(`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`)} aria-label="Share on X" title="Share on X" className="hidden rounded-xl border border-slate-200 p-2 text-[#697386] transition-colors hover:border-cyan-300 hover:text-cyan-600 sm:block"><span className="text-sm font-black">X</span></button>
                        <button onClick={handleShare} aria-label="Share article" title="Share article" className="rounded-xl bg-cyan-400 p-2 text-slate-950 transition-colors hover:bg-cyan-300"><Share2 size={15} /></button>
                    </div>
                </Motion.div>

                {/* ── Article Content ── */}
                <Motion.div
                    variants={fadeUp}
                    className="prose max-w-none text-slate-700 prose-headings:font-black prose-headings:text-[#111827] prose-a:text-cyan-700 prose-blockquote:border-cyan-400 prose-blockquote:text-slate-600 prose-img:rounded-2xl"
                    style={{ lineHeight: 1.9, fontFamily: '"Inter", sans-serif', fontSize: '1.08rem' }}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <AdSlot label="In-article advertisement" variant="inArticle" className="mb-10" />

                <div className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
                    <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-600">Share this story</p><p className="mt-1 text-sm text-slate-500">Pass it along to someone who will find it useful.</p></div>
                    <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
                        <button onClick={() => openShare(`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`)} aria-label="Share on X" title="Share on X" className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white">X</button>
                        <button onClick={() => openShare(`https://wa.me/?text=${shareText}%20${encodedUrl}`)} aria-label="Share on WhatsApp" title="Share on WhatsApp" className="rounded-xl bg-[#25D366] px-3 py-2 text-xs font-black text-white"><MessageCircle size={14} /></button>
                        <button onClick={() => openShare(`https://t.me/share/url?url=${encodedUrl}&text=${shareText}`)} aria-label="Share on Telegram" title="Share on Telegram" className="rounded-xl bg-[#229ED9] px-3 py-2 text-xs font-black text-white"><Send size={14} /></button>
                        <button onClick={handleShare} aria-label="Copy story link" title="Copy story link" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"><Link2 size={14} /></button>
                    </div>
                </div>

                <CommentsSection postId={post.id} />
                <NewsletterSignup />

                {/* Image caption */}
                {post.imageCaption && (
                    <p className="mb-10 text-center text-sm italic text-slate-500">{post.imageCaption}</p>
                )}
                </div>
            </div>

            {/* ── Related Posts ── */}
            {relatedPosts.length > 0 && (
                <div className="mx-auto max-w-6xl border-t border-slate-200 px-4 py-10 sm:px-6 sm:py-12">
                    <h2 className="mb-6 text-3xl font-black tracking-tighter text-[#111827] sm:mb-8" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>
                        You May Also Like <span style={{ color: colors.text }}>· {catName}</span>
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {relatedPosts.map(related => (
                            <div key={related.id} className="min-w-0 w-full">
                                <BlogPostCard post={related} onClick={() => onPostClick?.(related)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Motion.article>
    );
};

export default PostDetail;
