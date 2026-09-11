import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCms } from '../../lib/useCms';
import { categoryService } from '../../lib/storage';
import { ArrowLeft, Save, Eye, Upload } from 'lucide-react';

export default function AdminPostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, createPost, updatePost } = useCms();
  const isEditing = Boolean(id);

  const categories = categoryService.getAll();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    author: '',
    featuredImage: '',
    status: 'draft',
    isFeatured: false,
  });

  const [saving, setSaving] = useState(false);

  // Load post if editing
  useEffect(() => {
    if (isEditing && posts.length > 0) {
      const post = posts.find(p => p.id === id);
      if (post) {
        setForm({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          categoryId: post.categoryId || '',
          author: post.author || '',
          featuredImage: post.featuredImage || '',
          status: post.status || 'draft',
          isFeatured: post.isFeatured || false,
        });
      }
    }
  }, [id, posts, isEditing]);

  // Auto-generate slug from title
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setForm(prev => ({ ...prev, title, slug }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updatePost(id, form);
      } else {
        await createPost(form);
      }
      navigate('/admin/posts');
    } catch (err) {
      console.error(err);
      alert('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/posts')}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>
              {isEditing ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {isEditing ? 'Update your existing story' : 'Write and publish a new story'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleTitleChange}
            required
            className="w-full px-5 py-4 rounded-xl text-lg font-semibold focus:outline-none"
            style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            placeholder="Enter article title..."
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
            Slug
          </label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="w-full px-5 py-3 rounded-xl text-sm focus:outline-none"
            style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
            Excerpt
          </label>
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={3}
            className="w-full px-5 py-3 rounded-xl text-sm focus:outline-none resize-none"
            style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            placeholder="Short summary of the article..."
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
            Content *
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={14}
            required
            className="w-full px-5 py-4 rounded-xl text-sm focus:outline-none resize-y"
            style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            placeholder="Write your full article content here..."
          />
        </div>

        {/* Category + Author */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
              Category
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-xl text-sm focus:outline-none"
              style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-xl text-sm focus:outline-none"
              style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              placeholder="Author name"
            />
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
            Featured Image URL
          </label>
          <input
            type="url"
            name="featuredImage"
            value={form.featuredImage}
            onChange={handleChange}
            className="w-full px-5 py-3 rounded-xl text-sm focus:outline-none"
            style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            placeholder="https://images.unsplash.com/..."
          />
          {form.featuredImage && (
            <img
              src={form.featuredImage}
              alt="Preview"
              className="mt-4 w-full max-w-md h-48 object-cover rounded-xl"
            />
          )}
        </div>

        {/* Status + Featured */}
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="px-5 py-3 rounded-xl text-sm focus:outline-none"
              style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer mt-6">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
              className="w-5 h-5"
            />
            <span className="text-sm font-semibold">Feature this post</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/admin/posts')}
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm"
            style={{ background: '#22d3ee', color: '#000' }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : isEditing ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </form>
    </div>
  );
}