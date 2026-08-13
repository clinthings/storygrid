import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Feather, Upload, ChevronDown } from 'lucide-react';

const CATEGORIES = ['Fashion', 'Sports', 'Entertainment'];

const DEFAULT_IMAGES = {
    Fashion: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop',
    Sports: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&h=600&fit=crop',
    Entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
};

const CAT_COLORS = {
    Fashion: { text: '#f472b6', glow: 'rgba(244,114,182,0.25)', border: 'rgba(244,114,182,0.35)' },
    Sports: { text: '#22d3ee', glow: 'rgba(34,211,238,0.25)', border: 'rgba(34,211,238,0.35)' },
    Entertainment: { text: '#a78bfa', glow: 'rgba(167,139,250,0.25)', border: 'rgba(167,139,250,0.35)' },
};

const FIELD_BASE = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f0f0f5',
    borderRadius: '14px',
    padding: '14px 18px',
    width: '100%',
    outline: 'none',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

function Field({ label, children }) {
    return (
        <div>
            <label
                className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2"
                style={{ color: 'rgba(255,255,255,0.4)' }}
            >
                {label}
            </label>
            {children}
        </div>
    );
}

const CreatePostModal = ({ isOpen, onClose, onAddPost }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Sports');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [author, setAuthor] = useState('');
    const [focused, setFocused] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const colors = CAT_COLORS[category] || CAT_COLORS.Sports;
    const previewImage = imageUrl.trim() || DEFAULT_IMAGES[category];

    const fieldStyle = (id) => ({
        ...FIELD_BASE,
        borderColor: focused === id ? colors.border : 'rgba(255,255,255,0.08)',
        boxShadow: focused === id ? `0 0 0 3px ${colors.glow}` : 'none',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !excerpt.trim() || !content.trim()) return;

        const newPost = {
            id: Date.now(),
            title: title.trim(),
            category,
            excerpt: excerpt.trim(),
            content: content.trim(),
            imageUrl: previewImage,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            author: author.trim() || 'Guest Writer',
        };

        onAddPost(newPost);
        setSubmitted(true);
        setTimeout(() => {
            setTitle(''); setExcerpt(''); setContent(''); setImageUrl(''); setAuthor('');
            setSubmitted(false);
            onClose();
        }, 1200);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.25 } }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0"
                        style={{ background: 'rgba(5,5,7,0.88)', backdropFilter: 'blur(20px)' }}
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />

                    {/* Modal panel */}
                    <motion.div
                        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl overflow-hidden"
                        style={{
                            background: '#0e0e12',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px ${colors.glow}`,
                        }}
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 28 } }}
                        exit={{ scale: 0.94, opacity: 0, y: 20, transition: { duration: 0.25 } }}
                    >
                        {/* Top accent bar that changes with category */}
                        <motion.div
                            className="h-1 w-full flex-shrink-0"
                            animate={{ background: `linear-gradient(90deg, ${colors.text}, transparent)` }}
                            transition={{ duration: 0.4 }}
                        />

                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-7 py-5 flex-shrink-0"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    animate={{ background: `linear-gradient(135deg, ${colors.text}33, ${colors.text}11)`, border: `1px solid ${colors.border}` }}
                                >
                                    <Feather size={16} style={{ color: colors.text }} />
                                </motion.div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tight">New Story</h3>
                                    <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                        Share your perspective
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition"
                                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
                            >
                                <X size={16} />
                            </motion.button>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="overflow-y-auto flex-1 p-7 space-y-5 scrollbar-hide"
                        >
                            {/* Image preview strip */}
                            <div
                                className="relative w-full overflow-hidden rounded-2xl"
                                style={{ aspectRatio: '16/6', background: '#050507' }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={previewImage}
                                        src={previewImage}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        onError={(e) => { e.target.style.opacity = 0; }}
                                    />
                                </AnimatePresence>
                                <div
                                    className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                                    style={{ background: 'rgba(5,5,7,0.55)' }}
                                >
                                    <Upload size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
                                    <span className="text-[10px] text-white/40 font-medium">Cover Preview</span>
                                </div>
                            </div>

                            {/* Title */}
                            <Field label="Title *">
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onFocus={() => setFocused('title')}
                                    onBlur={() => setFocused(null)}
                                    style={fieldStyle('title')}
                                    placeholder="Enter a compelling title..."
                                />
                            </Field>

                            {/* Category + Author */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Category">
                                    <div className="relative">
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            onFocus={() => setFocused('cat')}
                                            onBlur={() => setFocused(null)}
                                            style={{ ...fieldStyle('cat'), appearance: 'none', paddingRight: '2.5rem', cursor: 'pointer' }}
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <ChevronDown
                                            size={14}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{ color: 'rgba(255,255,255,0.4)' }}
                                        />
                                    </div>
                                </Field>
                                <Field label="Author (optional)">
                                    <input
                                        type="text"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        onFocus={() => setFocused('author')}
                                        onBlur={() => setFocused(null)}
                                        style={fieldStyle('author')}
                                        placeholder="Your name"
                                    />
                                </Field>
                            </div>

                            {/* Image URL */}
                            <Field label="Cover Image URL (optional)">
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    onFocus={() => setFocused('img')}
                                    onBlur={() => setFocused(null)}
                                    style={fieldStyle('img')}
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </Field>

                            {/* Excerpt */}
                            <Field label="Excerpt *">
                                <input
                                    type="text"
                                    required
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    onFocus={() => setFocused('excerpt')}
                                    onBlur={() => setFocused(null)}
                                    style={fieldStyle('excerpt')}
                                    placeholder="One-sentence teaser..."
                                />
                            </Field>

                            {/* Content */}
                            <Field label="Full Content *">
                                <textarea
                                    required
                                    rows={8}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    onFocus={() => setFocused('content')}
                                    onBlur={() => setFocused(null)}
                                    style={{ ...fieldStyle('content'), resize: 'vertical', lineHeight: 1.7 }}
                                    placeholder="Write your full story here..."
                                />
                            </Field>

                            {/* Actions */}
                            <div className="flex gap-3 pt-3">
                                <motion.button
                                    type="button"
                                    onClick={onClose}
                                    whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.08)' }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition"
                                    style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02, boxShadow: `0 8px 30px ${colors.glow}` }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex-2 flex-1 py-3.5 rounded-2xl text-sm font-black transition-all relative overflow-hidden"
                                    style={{
                                        background: submitted
                                            ? '#10b981'
                                            : `linear-gradient(135deg, ${colors.text}, ${colors.text}bb)`,
                                        color: '#000',
                                        boxShadow: `0 4px 20px ${colors.glow}`,
                                    }}
                                    animate={{ background: submitted ? '#10b981' : undefined }}
                                >
                                    <AnimatePresence mode="wait">
                                        {submitted ? (
                                            <motion.span
                                                key="done"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                ✓ Published!
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                key="pub"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                Publish Story
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreatePostModal;
