// src/admin/components/PostEditor.jsx
// Rich text post editor using Tiptap
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useCms } from '../../lib/useCms';
import { slugify, calcReadingTime } from '../../lib/storage';
import ImageUploader from './ImageUploader';
import {
    Bold, Italic, UnderlineIcon, Strikethrough, Heading2, Heading3,
    List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight,
    Link2, Image, Undo, Redo, Eye, Save, Send, X, ChevronDown, Star
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const EXCERPT_LIMIT = 200;

function ToolbarBtn({ onClick, active, title, children, disabled }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 text-sm"
            style={{
                background: active ? 'rgba(34,211,238,0.15)' : 'transparent',
                color: active ? '#22d3ee' : 'rgba(255,255,255,0.55)',
                border: active ? '1px solid rgba(34,211,238,0.3)' : '1px solid transparent',
            }}
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />;
}

function EditorToolbar({ editor }) {
    if (!editor) return null;

    const setLink = () => {
        const prev = editor.getAttributes('link').href;
        const url = window.prompt('URL:', prev);
        if (url === null) return;
        if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = window.prompt('Image URL:');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    return (
        <div className="flex flex-wrap items-center gap-0.5 p-2 rounded-xl mb-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={14} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={14} /></ToolbarBtn>
            <ToolbarDivider />
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={14} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={14} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={14} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={14} /></ToolbarBtn>
            <ToolbarDivider />
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={14} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={14} /></ToolbarBtn>
            <ToolbarDivider />
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List size={14} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List"><ListOrdered size={14} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={14} /></ToolbarBtn>
            <ToolbarDivider />
            <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={14} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center"><AlignCenter size={14} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={14} /></ToolbarBtn>
            <ToolbarDivider />
            <ToolbarBtn onClick={setLink} active={editor.isActive('link')} title="Insert Link"><Link2 size={14} /></ToolbarBtn>
            <ToolbarBtn onClick={addImage} title="Insert Image URL"><Image size={14} /></ToolbarBtn>
        </div>
    );
}

export default function PostEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { posts, categories, createPost, updatePost, publishPost } = useCms();

    const isEditing = !!id;
    const existingPost = isEditing ? posts.find(p => p.id === id) : null;

    const [title, setTitle] = useState(existingPost?.title || '');
    const [slug, setSlug] = useState(existingPost?.slug || '');
    const [slugEdited, setSlugEdited] = useState(false);
    const [excerpt, setExcerpt] = useState(existingPost?.excerpt || '');
    const [categoryId, setCategoryId] = useState(existingPost?.categoryId || '');
    const [author, setAuthor] = useState(existingPost?.author || 'Segun Olubanjo');
    const [featuredImage, setFeaturedImage] = useState(existingPost?.featuredImage || '');
    const [imageAlt, setImageAlt] = useState(existingPost?.imageAlt || '');
    const [imageCaption, setImageCaption] = useState(existingPost?.imageCaption || '');
    const [isFeatured, setIsFeatured] = useState(existingPost?.isFeatured || false);
    const [status, setStatus] = useState(''); // '' | 'saving' | 'saved' | 'publishing' | 'published' | 'error'
    const [showPreview, setShowPreview] = useState(false);

    // Auto-generate slug from title
    useEffect(() => {
        if (!slugEdited && title) {
            setSlug(slugify(title));
        }
    }, [title, slugEdited]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            ImageExtension,
            LinkExtension.configure({ openOnClick: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Start writing your article here…' }),
            CharacterCount,
        ],
        content: existingPost?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] text-base leading-relaxed',
            },
        },
    });

    const getFormData = useCallback(() => ({
        title,
        slug,
        excerpt,
        categoryId,
        author,
        featuredImage,
        imageAlt,
        imageCaption,
        isFeatured,
        content: editor?.getHTML() || '',
    }), [title, slug, excerpt, categoryId, author, featuredImage, imageAlt, imageCaption, isFeatured, editor]);

    const validate = () => {
        if (!title.trim()) return 'Title is required.';
        if (!slug.trim()) return 'Slug is required.';
        if (!categoryId) return 'Please select a category.';
        if (!editor || editor.getHTML() === '<p></p>') return 'Article content is required.';
        return null;
    };

    const handleSaveDraft = async () => {
        const err = validate();
        if (err) { alert(err); return; }
        setStatus('saving');
        await new Promise(r => setTimeout(r, 300));
        const data = getFormData();
        if (isEditing) { updatePost(id, data); } else { createPost(data); }
        setStatus('saved');
        setTimeout(() => setStatus(''), 3000);
    };

    const handlePublish = async () => {
        const err = validate();
        if (err) { alert(err); return; }
        setStatus('publishing');
        await new Promise(r => setTimeout(r, 400));
        const data = getFormData();
        if (isEditing) {
            updatePost(id, data);
            publishPost(id);
        } else {
            const post = createPost(data);
            publishPost(post.id);
        }
        setStatus('published');
        setTimeout(() => navigate('/admin/published'), 1500);
    };

    const content = editor?.getHTML() || '';
    const readTime = calcReadingTime(content);
    const wordCount = editor?.storage?.characterCount?.words?.() || 0;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h1 className="text-3xl font-black tracking-tighter" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>
                    {isEditing ? 'Edit Article' : 'New Article'}
                </h1>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30">{wordCount} words · {readTime}</span>
                    <button type="button" onClick={() => setShowPreview(p => !p)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>
                        <Eye size={15} />Preview
                    </button>
                    <button type="button" onClick={handleSaveDraft} disabled={status === 'saving'}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                        <Save size={15} />
                        {status === 'saving' ? 'Saving…' : status === 'saved' ? '✓ Saved' : 'Save Draft'}
                    </button>
                    <button type="button" onClick={handlePublish} disabled={status === 'publishing'}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold"
                        style={{ background: '#22d3ee', color: '#000' }}>
                        <Send size={15} />
                        {status === 'publishing' ? 'Publishing…' : status === 'published' ? '✓ Published!' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Editor Area */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Title */}
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Article Title"
                            className="w-full text-3xl font-black bg-transparent border-0 border-b focus:outline-none pb-3"
                            style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontFamily: '"Bebas Neue", Impact, sans-serif', letterSpacing: '-0.02em' }}
                        />
                    </div>

                    {/* Slug */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/30 flex-shrink-0">slug:</span>
                        <input
                            type="text"
                            value={slug}
                            onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
                            className="flex-1 bg-transparent text-white/50 focus:outline-none focus:text-white transition-colors"
                            style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="rounded-xl p-4" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Excerpt</label>
                            <span className={`text-xs ${excerpt.length > EXCERPT_LIMIT ? 'text-red-400' : 'text-white/30'}`}>
                                {excerpt.length}/{EXCERPT_LIMIT}
                            </span>
                        </div>
                        <textarea
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            rows={3}
                            className="w-full bg-transparent text-sm leading-relaxed focus:outline-none resize-none"
                            style={{ color: 'rgba(255,255,255,0.7)' }}
                            placeholder="A short summary of the article (displayed in cards and search results)…"
                        />
                    </div>

                    {/* Rich Text Editor */}
                    <div className="rounded-xl overflow-hidden" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <EditorToolbar editor={editor} />
                        </div>
                        <div className="p-5">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-5">
                    {/* Publish Settings */}
                    <div className="rounded-xl p-5" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Publish Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-white/40 block mb-2">Category *</label>
                                <div className="relative">
                                    <select
                                        value={categoryId}
                                        onChange={e => setCategoryId(e.target.value)}
                                        className="w-full px-4 py-3 pr-8 rounded-xl text-sm font-medium appearance-none focus:outline-none"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f5' }}>
                                        <option value="">Select category…</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-white/40 block mb-2">Author</label>
                                <input
                                    type="text"
                                    value={author}
                                    onChange={e => setAuthor(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f5' }}
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div
                                    onClick={() => setIsFeatured(s => !s)}
                                    className="w-10 h-5 rounded-full transition-all relative cursor-pointer"
                                    style={{ background: isFeatured ? '#22d3ee' : 'rgba(255,255,255,0.1)' }}>
                                    <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                                        style={{ left: isFeatured ? '22px' : '2px' }} />
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-white/80">Featured Story</span>
                                    <Star size={12} className="inline ml-1" style={{ color: '#f472b6' }} />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="rounded-xl p-5" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Featured Image</h3>
                        <ImageUploader
                            value={featuredImage}
                            onChange={setFeaturedImage}
                        />
                        {featuredImage && (
                            <div className="mt-3 space-y-2">
                                <input
                                    type="text" value={imageAlt} onChange={e => setImageAlt(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0f5' }}
                                    placeholder="Alt text (for accessibility)"
                                />
                                <input
                                    type="text" value={imageCaption} onChange={e => setImageCaption(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0f5' }}
                                    placeholder="Image caption (optional)"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        className="fixed inset-0 z-50 overflow-y-auto"
                        style={{ background: '#050507' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}>
                        <button
                            onClick={() => setShowPreview(false)}
                            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                            style={{ background: '#22d3ee', color: '#000' }}>
                            <X size={16} />Exit Preview
                        </button>
                        <div className="max-w-4xl mx-auto px-6 py-24">
                            {featuredImage && (
                                <img src={featuredImage} alt={imageAlt || title}
                                    className="w-full rounded-2xl object-cover mb-10" style={{ maxHeight: '60vh' }} />
                            )}
                            {categoryId && (
                                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#22d3ee' }}>
                                    {categories.find(c => c.id === categoryId)?.name}
                                </p>
                            )}
                            <h1 className="text-5xl font-black tracking-tighter mb-4"
                                style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', letterSpacing: '-0.03em' }}>
                                {title || 'Untitled Article'}
                            </h1>
                            {excerpt && <p className="text-xl text-white/60 mb-8 leading-relaxed">{excerpt}</p>}
                            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-white/10 text-sm text-white/50">
                                <span className="font-semibold text-white/70">{author}</span>
                                <span>·</span>
                                <span>{readTime}</span>
                            </div>
                            <div
                                className="prose prose-invert max-w-none"
                                style={{ lineHeight: 1.9, fontSize: '1.05rem' }}
                                dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
