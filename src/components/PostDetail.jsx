// src/components/PostDetail.jsx — CMS-aware public article page
import React, { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Share2, Calendar, User } from 'lucide-react';
import { useCms } from '../lib/useCms';
import BlogPostCard from './BlogPostCard';
import { calcReadingTime, postService } from '../lib/storage';

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

const PostDetail = ({ post, onBack, onPostClick }) => {
    const { categories, publishedPosts } = useCms();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [post?.id]);

    if (!post) return null;

    const cat = categories.find(c => c.id === post.categoryId);
    const colors = CAT_COLORS[cat?.name] || { text: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)' };
    const readTime = calcReadingTime(post.content);
    const relatedPosts = publishedPosts
        .filter(p => p.categoryId === post.categoryId && p.id !== post.id)
        .slice(0, 3);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <motion.article className="min-h-screen" initial="hidden" animate="show" variants={stagger}>
            {/* ── Hero Image ── */}
            <div className="relative w-full overflow-hidden" style={{ height: 'clamp(300px, 55vh, 600px)' }}>
                <motion.img
                    src={post.featuredImage || post.imageUrl}
                    alt={post.imageAlt || post.title}
                    className="w-full h-full object-cover"
                    variants={{ hidden: { scale: 1.08 }, show: { scale: 1 } }}
                    transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(5,5,7,0.95) 0%, rgba(5,5,7,0.5) 40%, rgba(5,5,7,0.2) 100%)' }} />

                {/* Back button */}
                <motion.button
                    onClick={onBack}
                    variants={fadeUp}
                    className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors z-10"
                    style={{ background: 'rgba(5,5,7,0.6)', backdropFilter: 'blur(12px)', padding: '10px 18px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <ArrowLeft size={16} />Back
                </motion.button>
            </div>

            {/* ── Article Header ── */}
            <div className="max-w-3xl mx-auto px-6 -mt-24 relative z-10">
                {/* Category badge */}
                <motion.div variants={fadeUp} className="mb-5">
                    <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full"
                        style={{ color: colors.text, background: colors.bg, border: `1px solid ${colors.border}` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.text }} />
                        {cat?.name || post.category || 'Story'}
                    </span>
                </motion.div>

                {/* Title */}
                <motion.h1 variants={fadeUp} className="font-black leading-tight mb-6"
                    style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.03em' }}>
                    {post.title}
                </motion.h1>

                {/* Excerpt */}
                {post.excerpt && (
                    <motion.p variants={fadeUp} className="text-lg leading-relaxed mb-8"
                        style={{ color: 'rgba(255,255,255,0.65)', fontFamily: '"Inter", sans-serif' }}>
                        {post.excerpt}
                    </motion.p>
                )}

                {/* Meta bar */}
                <motion.div variants={fadeUp}
                    className="flex flex-wrap items-center gap-4 pb-8 mb-10 text-sm"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="flex items-center gap-2 text-white/70 font-semibold">
                        <User size={14} className="text-white/30" />
                        {post.author || 'Editorial Desk'}
                    </span>
                    <span className="text-white/20">|</span>
                    {post.publishedAt && (
                        <span className="flex items-center gap-2 text-white/40">
                            <Calendar size={14} />
                            {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    )}
                    <span className="flex items-center gap-2 text-white/40">
                        <Clock size={14} />
                        {readTime}
                    </span>
                    <button onClick={handleShare}
                        className="ml-auto flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white transition-colors px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Share2 size={13} />Share
                    </button>
                </motion.div>

                {/* ── Article Content ── */}
                <motion.div
                    variants={fadeUp}
                    className="prose prose-invert max-w-none mb-20"
                    style={{ lineHeight: 1.9, fontFamily: '"Inter", sans-serif', fontSize: '1.05rem', color: 'rgba(255,255,255,0.8)' }}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Image caption */}
                {post.imageCaption && (
                    <p className="text-sm text-white/30 italic text-center mb-10">{post.imageCaption}</p>
                )}
            </div>

            {/* ── Related Posts ── */}
            {relatedPosts.length > 0 && (
                <div className="max-w-6xl mx-auto px-6 py-12" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <h2 className="text-2xl font-black tracking-tighter mb-8" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>
                        More from <span style={{ color: colors.text }}>{cat?.name}</span>
                    </h2>
                    <div className="grid gap-8"
                        style={{ gridTemplateColumns: `repeat(${Math.min(relatedPosts.length, 3)}, 1fr)` }}>
                        {relatedPosts.map(related => (
                            <BlogPostCard key={related.id} post={related} onClick={() => onPostClick?.(related)} />
                        ))}
                    </div>
                </div>
            )}
        </motion.article>
    );
};

export default PostDetail;
