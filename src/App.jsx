// src/App.jsx — Full CMS router entry point
import React, { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, X, Zap } from 'lucide-react';

import { CmsProvider, useCms } from './lib/useCms';

// Public Components
import BlogGallery from './components/BlogGallery';
import BlogPostCard from './components/BlogPostCard';
import PostDetail from './components/PostDetail';

// Admin Components
import { AdminLayout } from './admin/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminPosts from './admin/pages/AdminPosts';
import AdminMedia from './admin/pages/AdminMedia';
import AdminCategories from './admin/pages/AdminCategories';
import AdminSettings from './admin/pages/AdminSettings';
import PostEditor from './admin/components/PostEditor';

// ── Protected Route ──────────────────────────────────────────────────────────

function ProtectedRoute({ children }) {
  const { isAdmin } = useCms();
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

// ── Public Header ─────────────────────────────────────────────────────────────

function PublicHeader({ searchQuery, onSearch }) {
  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 80], ['rgba(5,5,7,0)', 'rgba(5,5,7,0.92)']);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  return (
    <motion.header
      style={{ background: headerBg, backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 py-4 flex items-center justify-between gap-4">
      <button onClick={() => navigate('/')}
        className="text-2xl font-black tracking-tighter flex items-center gap-2 flex-shrink-0"
        style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', letterSpacing: '-0.02em' }}>
        <Zap size={20} fill="#22d3ee" color="#22d3ee" />
        <span className="text-white">STORY</span><span style={{ color: '#22d3ee' }}>GRID</span>
      </button>

      <div className="flex items-center gap-3">
        {searchOpen ? (
          <div className="flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 999, padding: '6px 16px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <Search size={15} className="text-white/40" />
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search articles…"
              className="bg-transparent text-sm text-white focus:outline-none w-48 sm:w-64"
            />
            <button onClick={() => { setSearchOpen(false); onSearch(''); }} className="text-white/40 hover:text-white">
              <X size={15} />
            </button>
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <Search size={18} />
          </button>
        )}
        <a href="/admin" className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
          style={{ background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)' }}>
          Admin
        </a>
      </div>
    </motion.header>
  );
}

// ── Featured Hero Section ────────────────────────────────────────────────────

function FeaturedHero({ post, onPostClick, categories }) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  if (!post) return null;
  const cat = categories.find(c => c.id === post.categoryId);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: 'min(90vh, 800px)', minHeight: 480 }}>
      <motion.div className="absolute inset-0" style={{ y: heroY }}>
        <img src={post.featuredImage || post.imageUrl} alt={post.imageAlt || post.title}
          className="w-full h-full object-cover" style={{ transform: 'scale(1.1)', transformOrigin: 'center' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,5,7,1) 0%, rgba(5,5,7,0.7) 40%, rgba(5,5,7,0.2) 100%)' }} />
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundSize: '200px' }} />
      </motion.div>

      <div className="absolute inset-0 flex flex-col justify-end px-8 sm:px-12 pb-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#22d3ee' }}>
            ★ Featured Story · {cat?.name}
          </p>
          <h1 className="font-black leading-none mb-6"
            style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', letterSpacing: '-0.03em' }}>
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-base sm:text-lg leading-relaxed mb-8 max-w-2xl"
              style={{ color: 'rgba(255,255,255,0.65)', fontFamily: '"Inter", sans-serif' }}>
              {post.excerpt}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => onPostClick(post)}
              className="px-7 py-3.5 rounded-xl text-sm font-black transition-all hover:scale-105"
              style={{ background: '#22d3ee', color: '#000' }}>
              Read Story →
            </button>
            <span className="text-white/40 text-sm">{post.author} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Public Home Page ──────────────────────────────────────────────────────────

function HomePage() {
  const { featuredPost, categories } = useCms();
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (selectedPost) {
    return (
      <>
        <PublicHeader searchQuery={searchQuery} onSearch={setSearchQuery} />
        <div className="pt-0">
          <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} onPostClick={setSelectedPost} />
        </div>
      </>
    );
  }

  return (
    <>
      <PublicHeader searchQuery={searchQuery} onSearch={setSearchQuery} />
      <main>
        {!searchQuery && <FeaturedHero post={featuredPost} onPostClick={setSelectedPost} categories={categories} />}
        <BlogGallery onPostClick={setSelectedPost} searchQuery={searchQuery} />
      </main>
    </>
  );
}

// ── Admin Guard ─────────────────────────────────────────────────────────────

function AdminGuard({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <CmsProvider>
      <BrowserRouter>
        <div style={{ background: '#050507', color: '#f0f0f5', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/posts" element={<AdminGuard><AdminPosts /></AdminGuard>} />
            <Route path="/admin/posts/new" element={<AdminGuard><PostEditor /></AdminGuard>} />
            <Route path="/admin/posts/:id" element={<AdminGuard><PostEditor /></AdminGuard>} />
            <Route path="/admin/drafts" element={<AdminGuard><AdminPosts filterStatus="draft" /></AdminGuard>} />
            <Route path="/admin/published" element={<AdminGuard><AdminPosts filterStatus="published" /></AdminGuard>} />
            <Route path="/admin/media" element={<AdminGuard><AdminMedia /></AdminGuard>} />
            <Route path="/admin/categories" element={<AdminGuard><AdminCategories /></AdminGuard>} />
            <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CmsProvider>
  );
}
