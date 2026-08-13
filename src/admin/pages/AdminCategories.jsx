// src/admin/pages/AdminCategories.jsx
import React, { useState } from 'react';
import { useCms } from '../../lib/useCms';
import { slugify } from '../../lib/storage';
import { Plus, Pencil, Trash2, Check, X, AlertTriangle } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategories() {
    const { categories, posts, createCategory, updateCategory, deleteCategory } = useCms();
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [editing, setEditing] = useState(null); // { id, name, slug, description }
    const [confirmDelete, setConfirmDelete] = useState(null);

    const postCountFor = (id) => posts.filter(p => p.categoryId === id).length;

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        createCategory({ name: newName.trim(), slug: slugify(newName.trim()), description: newDesc.trim() });
        setNewName(''); setNewDesc('');
    };

    const handleSaveEdit = () => {
        if (!editing?.name?.trim()) return;
        updateCategory(editing.id, { name: editing.name.trim(), slug: slugify(editing.name), description: editing.description });
        setEditing(null);
    };

    const doDelete = () => {
        deleteCategory(confirmDelete);
        setConfirmDelete(null);
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-4xl font-black tracking-tighter mb-8" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>Categories</h1>

            {/* Create Form */}
            <form onSubmit={handleCreate} className="rounded-2xl p-6 mb-8"
                style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">New Category</h2>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text" value={newName} onChange={e => setNewName(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f5' }}
                        placeholder="Category name"
                    />
                    <button type="submit" className="px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
                        style={{ background: '#22d3ee', color: '#000' }}>
                        <Plus size={16} />Add
                    </button>
                </div>
                <input
                    type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f5' }}
                    placeholder="Optional description"
                />
                {newName && (
                    <p className="mt-2 text-xs text-white/30">Slug: <code className="text-white/50">{slugify(newName)}</code></p>
                )}
            </form>

            {/* Category List */}
            <div className="space-y-3">
                {categories.map((cat, i) => (
                    <motion.div key={cat.id}
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="rounded-xl p-5" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {editing?.id === cat.id ? (
                            <div className="flex items-center gap-3">
                                <input
                                    value={editing.name} onChange={e => setEditing(s => ({ ...s, name: e.target.value }))}
                                    className="flex-1 px-4 py-2 rounded-lg text-sm focus:outline-none"
                                    style={{ background: 'rgba(255,255,255,0.08)', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.12)' }}
                                />
                                <button onClick={handleSaveEdit} className="w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                                    <Check size={16} />
                                </button>
                                <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-sm">{cat.name}</p>
                                    <p className="text-xs text-white/30 mt-0.5">/{cat.slug} · {postCountFor(cat.id)} posts</p>
                                    {cat.description && <p className="text-xs text-white/40 mt-1">{cat.description}</p>}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setEditing(cat)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => setConfirmDelete(cat.id)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Confirm Delete */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        style={{ background: 'rgba(0,0,0,0.8)' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="rounded-2xl p-8 max-w-md w-full text-center"
                            style={{ background: '#0e0e14', border: '1px solid rgba(255,255,255,0.1)' }}
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                            <AlertTriangle size={36} className="mx-auto mb-4" style={{ color: '#fbbf24' }} />
                            <p className="font-semibold mb-2">Delete this category?</p>
                            <p className="text-sm text-white/40 mb-6">Posts in this category will become uncategorized.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-xl text-sm font-bold"
                                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>
                                    Cancel
                                </button>
                                <button onClick={doDelete} className="flex-1 py-3 rounded-xl text-sm font-bold"
                                    style={{ background: '#ef4444', color: '#fff' }}>
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
