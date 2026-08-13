import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const getReadingTime = (content) => {
    if (!content) return '1 min';
    const words = content.trim().split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
};

// Subtle colors for editorial look
const CAT_COLORS = {
    Technology: { text: '#22d3ee', dot: '#22d3ee' },
    Education: { text: '#f472b6', dot: '#f472b6' },
    Business: { text: '#a78bfa', dot: '#a78bfa' },
    Productivity: { text: '#34d399', dot: '#34d399' },
    Future: { text: '#fbbf24', dot: '#fbbf24' },
};

const BlogPostCard = ({ post, onClick, featured = false }) => {
    const colors = CAT_COLORS[post.category] || CAT_COLORS.Sports;

    return (
        <motion.article
            onClick={onClick}
            whileHover="hover"
            className="group relative flex flex-col cursor-pointer select-none h-full bg-[#050507]"
        >
            {/* ── Image Container (Sharp/Editorial) ── */}
            <div
                className="relative overflow-hidden bg-[#111] mb-6"
                style={{ aspectRatio: featured ? '2/1' : '16/9' }}
            >
                <motion.img
                    src={post.imageUrl}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    variants={{
                        hover: { scale: 1.03, transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] } },
                    }}
                    loading="lazy"
                />

                {/* Hover overlay gradient (subtle dark bottom) */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)',
                    }}
                    initial={{ opacity: 0 }}
                    variants={{
                        hover: { opacity: 1, transition: { duration: 0.4 } },
                    }}
                />
            </div>

            {/* ── Text Content ── */}
            <div className="flex flex-col flex-grow px-1 sm:px-2">

                {/* Category & Read Time */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.dot }} />
                        <span
                            className="text-[11px] font-bold uppercase tracking-widest"
                            style={{ color: colors.text }}
                        >
                            {post.category}
                        </span>
                    </div>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-white/40 text-xs font-medium uppercase tracking-wider">
                        {getReadingTime(post.content)}
                    </span>
                </div>

                {/* Title */}
                <motion.h3
                    className="font-bold leading-tight mb-4 group-hover:text-white transition-colors duration-300"
                    style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: featured ? 'clamp(2rem, 3.5vw, 3rem)' : 'clamp(1.25rem, 2vw, 1.75rem)',
                        letterSpacing: '-0.02em',
                        color: 'rgba(255,255,255,0.92)'
                    }}
                >
                    {post.title}
                </motion.h3>

                {/* Excerpt */}
                <p
                    className="text-sm sm:text-base leading-relaxed mb-6 line-clamp-2 sm:line-clamp-3"
                    style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: '"Inter", sans-serif',
                        fontSize: featured ? '1.1rem' : '0.95rem'
                    }}
                >
                    {post.excerpt}
                </p>

                {/* Author & Date at bottom */}
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-white/80">
                            {post.author || 'Editorial Desk'}
                        </span>
                        <span className="text-white/20 text-xs">|</span>
                        <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                            {post.date}
                        </span>
                    </div>
                </div>
            </div>
        </motion.article>
    );
};

export default BlogPostCard;
