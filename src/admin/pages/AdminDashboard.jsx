// src/admin/pages/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCms } from '../../lib/useCms';
import { FileText, BookMarked, Archive, Star, FolderOpen, PenSquare, ArrowUpRight } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

function StatCard({ label, value, icon: Icon, color, href }) {
    const card = (
        <motion.div
            whileHover={{ y: -2 }}
            className="p-6 rounded-2xl flex items-start justify-between group"
            style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                <p className="text-4xl font-black" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', letterSpacing: '-0.02em' }}>{value}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={22} style={{ color }} />
            </div>
        </motion.div>
    );
    return href ? <Link to={href}>{card}</Link> : card;
}

export default function AdminDashboard() {
    const { posts, publishedPosts, draftPosts, featuredPost, categories } = useCms();
    const featured = posts.filter(p => p.isFeatured).length;

    const recentPosts = [...publishedPosts].slice(0, 5);

    return (
        <div>
            <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', letterSpacing: '-0.02em' }}>Dashboard</h1>
                    <p className="text-white/40 text-sm mt-1">Welcome back. Here's what's happening on STORYGRID.</p>
                </div>
                <Link to="/admin/posts/new"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm"
                    style={{ background: '#22d3ee', color: '#000' }}>
                    <PenSquare size={16} />
                    New Article
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard label="Total Posts" value={posts.length} icon={FileText} color="#22d3ee" href="/admin/posts" />
                <StatCard label="Published" value={publishedPosts.length} icon={BookMarked} color="#34d399" href="/admin/published" />
                <StatCard label="Drafts" value={draftPosts.length} icon={Archive} color="#fbbf24" href="/admin/drafts" />
                <StatCard label="Featured" value={featured} icon={Star} color="#f472b6" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Posts */}
                <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">Recent Articles</h2>
                        <Link to="/admin/posts" className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1">View all <ArrowUpRight size={12} /></Link>
                    </div>
                    <div className="space-y-3">
                        {recentPosts.length === 0 && (
                            <p className="text-white/30 text-sm">No published posts yet.</p>
                        )}
                        {recentPosts.map(post => (
                            <Link key={post.id} to={`/admin/posts/${post.id}`}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                                {post.featuredImage && (
                                    <img src={post.featuredImage} alt={post.imageAlt || post.title}
                                        className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate group-hover:text-white/90">{post.title}</p>
                                    <p className="text-xs text-white/40 mt-0.5">{post.author} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}</p>
                                </div>
                                <span className="text-[11px] px-2 py-1 rounded-lg font-bold flex-shrink-0"
                                    style={{ background: post.status === 'published' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)', color: post.status === 'published' ? '#34d399' : '#fbbf24' }}>
                                    {post.status}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Categories & Featured */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-2xl p-6" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Categories</h2>
                            <Link to="/admin/categories" className="text-xs text-white/40 hover:text-white transition-colors"><FolderOpen size={14} /></Link>
                        </div>
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex justify-between items-center">
                                    <span className="text-sm text-white/70">{cat.name}</span>
                                    <span className="text-xs text-white/30">{posts.filter(p => p.categoryId === cat.id && p.status === 'published').length} posts</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {featuredPost && (
                        <div className="rounded-2xl p-6" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <Star size={14} style={{ color: '#f472b6' }} />
                                <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest">Featured Story</h2>
                            </div>
                            {featuredPost.featuredImage && (
                                <img src={featuredPost.featuredImage} alt={featuredPost.title}
                                    className="w-full h-24 object-cover rounded-xl mb-3" />
                            )}
                            <p className="text-sm font-semibold line-clamp-2">{featuredPost.title}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
