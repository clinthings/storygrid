import React from 'react';
import { motion as Motion } from 'framer-motion';
import { calcReadingTime } from '../lib/storage';

const CAT_COLORS = {
    Technology: { text: '#22d3ee', dot: '#22d3ee' },
    Education: { text: '#f472b6', dot: '#f472b6' },
    Business: { text: '#a78bfa', dot: '#a78bfa' },
    Productivity: { text: '#34d399', dot: '#34d399' },
    Future: { text: '#fbbf24', dot: '#fbbf24' },
};

const BlogPostCard = ({ post, onClick, featured = false, compact = false }) => {
    const category = post.category || 'Story';
    const colors = CAT_COLORS[category] || { text: '#22d3ee', dot: '#22d3ee' };
    const dateStr = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Draft';

    return (
        <Motion.article
            onClick={onClick}
            whileHover={{ y: -5 }}
            className="public-card group relative flex h-full w-full min-w-0 cursor-pointer select-none flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#09090d] p-2.5 sm:p-3"
        >
            <div className="relative overflow-hidden rounded-[18px] bg-[#111]" style={{ aspectRatio: compact ? '1.85 / 1' : featured ? '16 / 9' : '4 / 3' }}>
                <Motion.img
                    src={post.featuredImage || post.imageUrl}
                    alt={post.imageAlt || post.title}
                    width="1200"
                    height="800"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            </div>

            <div className="flex flex-1 flex-col px-1 py-4 sm:px-2">
                {post.isSponsored && <span className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Sponsored</span>}
                <div className="mb-3 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: colors.dot }} />
                        <span style={{ color: colors.text }}>{category}</span>
                    </div>
                    <span className="text-white/35">{calcReadingTime(post.content)}</span>
                </div>

                <h3
                    className="mb-3 font-bold leading-tight text-white transition-colors group-hover:text-white/90"
                    style={{
                        fontFamily: '"Inter", sans-serif',
                        letterSpacing: '-0.02em',
                        fontSize: compact ? '1.05rem' : featured ? 'clamp(1.65rem, 3vw, 3rem)' : 'clamp(1.25rem, 2.2vw, 1.75rem)',
                    }}
                >
                    {post.title}
                </h3>

                {!compact && (
                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-white/60 sm:text-[0.98rem]">
                        {post.excerpt}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-[11px] text-white/50">
                    <span className="font-medium text-white/70">{post.author || 'Editorial Desk'}</span>
                    <span>{dateStr}</span>
                </div>
            </div>
        </Motion.article>
    );
};

export default BlogPostCard;
