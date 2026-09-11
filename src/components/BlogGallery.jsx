// src/components/BlogGallery.jsx — CMS-aware public gallery
import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import BlogPostCard from './BlogPostCard';
import { Search } from 'lucide-react';

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function getCategoryName(post, categories = []) {
    if (post?.category) return post.category;
    if (post?.categoryId) {
        const found = categories.find((cat) => cat.id === post.categoryId);
        return found ? found.name : 'Story';
    }
    return 'Story';
}

const BlogGallery = ({ onPostClick, searchQuery = '', publishedPosts = [], categories = [], activeCategory = 'All' }) => {
    const filtered = publishedPosts.filter((post) => {
        const catName = getCategoryName(post, categories);
        const matchesCategory = activeCategory === 'All' || catName === activeCategory;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch = !q || [post.title, post.excerpt, post.content || '', catName].join(' ').toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
    });

    return (
        <section className="w-full" id="gallery">
            <AnimatePresence mode="wait">
                {filtered.length === 0 ? (
                    <Motion.div
                        key="empty-state"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="rounded-[24px] border border-white/10 bg-[#0b0b10] p-10 text-center"
                    >
                        <Search size={34} className="mx-auto mb-4 text-white/20" />
                        <p className="text-xl font-semibold text-white">No articles found</p>
                        <p className="mt-2 text-sm text-white/40">
                            {searchQuery ? `No results for “${searchQuery}”` : 'Check back soon for new stories.'}
                        </p>
                    </Motion.div>
                ) : (
                    <Motion.div
                        key={activeCategory + searchQuery}
                        className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {filtered.map((post, index) => (
                            <Motion.div key={post.id} variants={itemVariants}>
                                <BlogPostCard
                                    post={post}
                                    onClick={() => onPostClick(post)}
                                    featured={index === 0 && filtered.length > 1}
                                    compact={false}
                                />
                            </Motion.div>
                        ))}
                    </Motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default BlogGallery;
