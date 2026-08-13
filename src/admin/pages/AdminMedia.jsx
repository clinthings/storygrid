// src/admin/pages/AdminMedia.jsx
import React, { useRef, useState } from 'react';
import { useCms } from '../../lib/useCms';
import { Upload, Trash2, X, Check } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminMedia({ onSelect }) {
    const { media, uploadMedia, deleteMedia } = useCms();
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [selected, setSelected] = useState(null);

    const handleFiles = async (files) => {
        setUploading(true);
        for (const file of Array.from(files)) {
            if (file.type.startsWith('image/')) await uploadMedia(file);
        }
        setUploading(false);
    };

    const handleSelect = (item) => {
        setSelected(item.id);
        if (onSelect) onSelect(item.url);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h1 className="text-4xl font-black tracking-tighter" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>Media Library</h1>
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm"
                    style={{ background: '#22d3ee', color: '#000' }}>
                    <Upload size={16} />
                    {uploading ? 'Uploading…' : 'Upload Images'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => handleFiles(e.target.files)} />
            </div>

            {media.length === 0 ? (
                <div className="text-center py-24 rounded-2xl"
                    style={{ background: '#0a0a0f', border: '2px dashed rgba(255,255,255,0.07)' }}>
                    <Upload size={36} className="mx-auto mb-4 text-white/20" />
                    <p className="text-white/30 text-sm">No media uploaded yet.</p>
                    <p className="text-white/20 text-xs mt-1">Click "Upload Images" to add your first image.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[...media].reverse().map((item, i) => (
                        <motion.div key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => handleSelect(item)}
                            className="relative group rounded-xl overflow-hidden cursor-pointer"
                            style={{
                                aspectRatio: '1/1',
                                border: selected === item.id ? '2px solid #22d3ee' : '2px solid transparent',
                                background: '#0a0a0f',
                            }}>
                            <img src={item.url} alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            {selected === item.id && (
                                <div className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ background: '#22d3ee' }}>
                                    <Check size={12} color="#000" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-end justify-between p-2">
                                <button
                                    onClick={e => { e.stopPropagation(); deleteMedia(item.id); }}
                                    className="w-7 h-7 rounded-full flex items-center justify-center bg-red-500/80 hover:bg-red-500 transition-colors">
                                    <Trash2 size={13} />
                                </button>
                                <p className="text-[10px] text-white/70 truncate w-full text-right">{item.name}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
