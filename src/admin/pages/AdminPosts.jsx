// src/admin/pages/AdminPosts.jsx
// Used for both All Posts, Drafts, and Published filtered views

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCms } from '../../lib/useCms';
import { categoryService } from '../../lib/storage';
import { PenSquare, Eye, Trash2, Star, StarOff, Globe, Archive, Search, AlertTriangle } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

function StatusBadge({ status }) {
    const config = {
        published: { label: 'Published', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
        draft: { label: 'Draft', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    };
    const s = config[status] || config.draft;
    return (
        <span className="text-[11px] px-2.5 py-1 rounded-lg font-bold flex-shrink-0"
            style={{ background: s.bg, color: s.color }}>
            {s.label}
        </span>
    );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="rounded-2xl p-8 max-w-md w-full"
                style={{ background: '#0e0e14', border: '1px solid rgba(255,255,255,0.1)' }}
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
                <AlertTriangle size={36} className="mx-auto mb-4" style={{ color: '#fbbf24' }} />
                <p className="text-center text-base font-semibold mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-xl text-sm font-bold"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-3 rounded-xl text-sm font-bold"
                        style={{ background: '#ef4444', color: '#fff' }}>
                        Yes, Delete
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function AdminPosts({ filterStatus }) {
    const { posts, publishPost, unpublishPost, deletePost, toggleFeatured } = useCms();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);

    const categories = categoryService.getAll();
    const getCatName = (id) => categories.find(c => c.id === id)?.name || 'Uncategorized';

    const filtered = posts
        .filter(p => !filterStatus || p.status === filterStatus)
        .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const handleDelete = (id) => setConfirmDelete(id);
    const doDelete = () => { deletePost(confirmDelete); setConfirmDelete(null); };

    const title = filterStatus === 'published' ? 'Published' : filterStatus === 'draft' ? 'Drafts' : 'All Posts';

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <h1 className="text-4xl font-black tracking-tighter" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>{title}</h1>
                <Link to="/admin/posts/new"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm"
                    style={{ background: '#22d3ee', color: '#000' }}>
                    <PenSquare size={16} />New Article
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none"
                    style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)', color: '#f0f0f5' }}
                    placeholder="Search posts…"
                />
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                {filtered.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-white/30 text-sm">No posts found.</p>
                        <Link to="/admin/posts/new" className="mt-4 inline-block text-sm font-bold" style={{ color: '#22d3ee' }}>Create your first article →</Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {['Article', 'Category', 'Status', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-5 py-4 text-xs font-bold uppercase tracking-widest text-white/30">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((post, i) => (
                                <motion.tr key={post.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="group hover:bg-white/[0.02] transition-colors"
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    {/* Title + Thumb */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {post.featuredImage ? (
                                                <img src={post.featuredImage} alt={post.title} className="w-12 h-8 object-cover rounded-lg flex-shrink-0" />
                                            ) : (
                                                <div className="w-12 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                    <Archive size={12} className="text-white/20" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate max-w-xs">{post.title}</p>
                                                {post.isFeatured && <Star size={11} className="inline mt-0.5" style={{ color: '#f472b6' }} />}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs text-white/50">{getCatName(post.categoryId)}</span>
                                    </td>
                                    <td className="px-5 py-4"><StatusBadge status={post.status} /></td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs text-white/40">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : `Draft ${new Date(post.updatedAt).toLocaleDateString()}`}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => navigate(`/admin/posts/${post.id}`)} title="Edit"
                                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition">
                                                <PenSquare size={14} />
                                            </button>
                                            <button onClick={() => window.open(`/post/${post.slug}`, '_blank')} title="Preview"
                                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition">
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                onClick={() => post.status === 'published' ? unpublishPost(post.id) : publishPost(post.id)}
                                                title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition">
                                                {post.status === 'published' ? <Archive size={14} /> : <Globe size={14} style={{ color: '#34d399' }} />}
                                            </button>
                                            <button onClick={() => toggleFeatured(post.id, !post.isFeatured)} title={post.isFeatured ? 'Unfeature' : 'Feature'}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition">
                                                {post.isFeatured ? <StarOff size={14} style={{ color: '#f472b6' }} /> : <Star size={14} />}
                                            </button>
                                            <button onClick={() => handleDelete(post.id)} title="Delete"
                                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Confirm Delete Dialog */}
            <AnimatePresence>
                {confirmDelete && (
                    <ConfirmDialog
                        message="Are you sure you want to permanently delete this article? This action cannot be undone."
                        onConfirm={doDelete}
                        onCancel={() => setConfirmDelete(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
