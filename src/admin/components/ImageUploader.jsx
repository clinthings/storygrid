// src/admin/components/ImageUploader.jsx
import React, { useRef, useState } from 'react';
import { useCms } from '../../lib/useCms';
import { Upload, Link2, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUploader({ value, onChange }) {
    const { uploadMedia } = useCms();
    const fileRef = useRef(null);
    const [tab, setTab] = useState('upload'); // 'upload' | 'url'
    const [urlInput, setUrlInput] = useState('');
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setUploading(true);
        const item = await uploadMedia(file);
        onChange(item.url);
        setUploading(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            setUrlInput('');
        }
    };

    if (value) {
        return (
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <img src={value} alt="Featured" className="w-full h-full object-cover" />
                <button onClick={() => onChange('')}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-black/70 text-white hover:bg-red-500/80 transition-all">
                    <X size={14} />
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-3">
                {[['upload', 'Upload'], ['url', 'URL']].map(([key, label]) => (
                    <button key={key} type="button" onClick={() => setTab(key)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                        style={{
                            background: tab === key ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.05)',
                            color: tab === key ? '#22d3ee' : 'rgba(255,255,255,0.4)',
                        }}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'upload' ? (
                <div
                    className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-8 px-4 text-center cursor-pointer transition-all"
                    style={{ borderColor: dragging ? '#22d3ee' : 'rgba(255,255,255,0.12)', background: dragging ? 'rgba(34,211,238,0.04)' : 'rgba(255,255,255,0.02)' }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                    {uploading ? (
                        <p className="text-sm text-white/50">Uploading…</p>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.1)' }}>
                                <Upload size={18} style={{ color: '#22d3ee' }} />
                            </div>
                            <p className="text-xs text-white/40">Drop an image here or click to upload</p>
                        </>
                    )}
                </div>
            ) : (
                <form onSubmit={handleUrlSubmit} className="flex gap-2">
                    <input
                        type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                        className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f5' }}
                        placeholder="https://images.unsplash.com/…"
                    />
                    <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-bold" style={{ background: '#22d3ee', color: '#000' }}>
                        <Link2 size={16} />
                    </button>
                </form>
            )}
        </div>
    );
}
