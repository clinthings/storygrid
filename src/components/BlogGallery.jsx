// src/components/BlogGallery.jsx — CMS-aware public gallery
import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import BlogPostCard from './BlogPostCard';
import { useCms } from '../lib/useCms';
import { Search } from 'lucide-react';

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const BlogGallery = ({ onPostClick, searchQuery = '' }) => {
    const { publishedPosts, categories } = useCms();
    const [filter, setFilter] = useState('All');

    const filtered = publishedPosts.filter(post => {
        const cat = categories.find(c => c.id === post.categoryId);
        const matchesCategory = filter === 'All' || cat?.name === filter;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            post.title.toLowerCase().includes(q) ||
            post.excerpt.toLowerCase().includes(q) ||
            post.content?.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
    });

    const CATEGORY_NAMES = ['All', ...categories.map(c => c.name)];

    return (
        <section className="w-full px-6 sm:px-8 lg:px-12 py-16 max-w-screen-xl mx-auto" id="gallery">
            {/* Category Tabs */}
            <div className="flex items-center gap-6 mb-12 overflow-x-auto pb-2"
                style={{ scrollbarWidth: 'none' }}>
                {CATEGORY_NAMES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className="relative text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap py-1 flex-shrink-0"
                        style={{ color: filter === cat ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                        {cat}
                        {filter === cat && (
                            <motion.div layoutId="tab-underline" className="absolute -bottom-1 left-0 right-0 h-px"
                                style={{ background: '#22d3ee' }}
                                transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
                <div className="py-24 text-center">
                    <Search size={36} className="mx-auto mb-4 text-white/20" />
                    <p className="text-white/30 text-lg font-semibold">No articles found</p>
                    <p className="text-white/20 text-sm mt-1">
                        {searchQuery ? `Try a different search term.` : 'Check back soon for new stories.'}
                    </p>
                </div>
            )}

            {/* Grid */}
            <AnimatePresence mode="wait">
                {filtered.length > 0 && (
                    <motion.div
                        key={filter + searchQuery}
                        className="grid gap-10"
                        style={{
                            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
                        }}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible">
                        {filtered.map((post, i) => (
                            <motion.div key={post.id} variants={itemVariants}
                                style={{ gridColumn: i === 0 && filtered.length > 1 ? 'span 2' : 'span 1' }}
                                className={i === 0 && filtered.length > 1 ? 'sm:col-span-2' : ''}>
                                <BlogPostCard post={post} onClick={() => onPostClick(post)} featured={i === 0 && filtered.length > 1} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default BlogGallery;
