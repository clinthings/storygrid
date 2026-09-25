// src/App.jsx
import React, { useMemo, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  motion as Motion,
  useScroll,
  useTransform,
} from 'framer-motion';

import { Search, X, Zap, Sun, Moon } from 'lucide-react';

import { CmsProvider, useCms } from './lib/useCms';

// Public Components
import BlogGallery from './components/BlogGallery';
import BlogPostCard from './components/BlogPostCard';
import PostDetail from './components/PostDetail';
import AccountPage from './components/AccountPage';
import NewsletterSignup from './components/NewsletterSignup';
import CookieConsent from './components/CookieConsent';
import CategoryPage from './components/CategoryPage';
import AdSlot from './components/AdSlot';
import PublicFooter from './components/PublicFooter';
import AdvertisePage from './components/AdvertisePage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import { useTheme } from './lib/ThemeProvider';

function SeoMeta({ post }) {
  React.useEffect(() => {
    const title = post ? `${post.title} | StoryGrid` : 'StoryGrid | Independent Stories and Ideas';
    const description = post?.excerpt || 'Independent stories, ideas, and perspectives for a changing world.';
    document.title = title;
    const setMeta = (selector, attribute, value) => {
      let element = document.head.querySelector(selector);
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, selector.includes('property') ? selector.match(/"([^"]+)"/)[1] : selector.match(/"([^"]+)"/)[1]); document.head.appendChild(element); }
      element.setAttribute('content', value);
    };
    setMeta('meta[name="description"]', 'name', description);
    setMeta('meta[property="og:title"]', 'property', title);
    setMeta('meta[property="og:description"]', 'property', description);
    setMeta('meta[property="og:type"]', 'property', post ? 'article' : 'website');
    if (post?.featuredImage) setMeta('meta[property="og:image"]', 'property', post.featuredImage);
    setMeta('meta[name="twitter:card"]', 'name', post?.featuredImage ? 'summary_large_image' : 'summary');
    setMeta('meta[name="twitter:title"]', 'name', title);
    setMeta('meta[name="twitter:description"]', 'name', description);
    if (post?.featuredImage) setMeta('meta[name="twitter:image"]', 'name', post.featuredImage);
    let canonical = document.head.querySelector('link[data-storygrid-canonical]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.dataset.storygridCanonical = 'true';
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${post?.slug ? `/article/${post.slug}` : window.location.pathname}`;
    const existing = document.head.querySelector('script[data-storygrid-schema]');
    if (existing) existing.remove();
    if (post) {
      const schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.dataset.storygridSchema = 'true';
      schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description, image: post.featuredImage ? [post.featuredImage] : undefined, author: { '@type': 'Person', name: post.author || 'StoryGrid Editorial Desk' }, datePublished: post.publishedAt, mainEntityOfPage: window.location.href });
      document.head.appendChild(schema);
    }
    return () => {
      const schema = document.head.querySelector('script[data-storygrid-schema]');
      if (schema) schema.remove();
    };
  }, [post]);
  return null;
}

// Admin Components
import { AdminLayout } from './admin/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminPosts from './admin/pages/AdminPosts';
import AdminMedia from './admin/pages/AdminMedia';
import AdminCategories from './admin/pages/AdminCategories';
import AdminSettings from './admin/pages/AdminSettings';
import AdminComments from './admin/pages/AdminComments';
import PostEditor from './admin/components/PostEditor';


// ─────────────────────────────────────────────────────────────
// PUBLIC HEADER
// ─────────────────────────────────────────────────────────────

function PublicHeader({ searchQuery, onSearch, categories = [] }) {
  const { scrollY } = useScroll();

  const headerBg = useTransform(
    scrollY,
    [0, 80],
    ['rgba(5,5,7,0)', 'rgba(5,5,7,0.9)']
  );

  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Latest', href: '#latest' },
    { label: 'Categories', href: '#categories' },
    { label: 'Account', href: '/account' },
    ...categories.slice(0, 4).map((cat) => ({ label: cat.name, href: `/category/${cat.slug}` })),
  ];

  return (
    <Motion.header
      style={{
        background: theme === 'light' ? 'rgba(255,255,255,0.9)' : headerBg,
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
      className={`public-header fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-10 py-3 ${theme}`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-black tracking-tighter flex items-center gap-2 flex-shrink-0"
          style={{
            fontFamily: '"Bebas Neue", Impact, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          <Zap size={20} fill="#22d3ee" color="#22d3ee" />
          <span className="public-brand-word text-white">STORY</span>
          <span style={{ color: '#22d3ee' }}>GRID</span>
        </button>

        <nav className="public-nav hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle rounded-xl p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {searchOpen ? (
            <div
              className="flex items-center gap-2"
              style={{
                background: 'rgba(255,255,255,0.07)',
                borderRadius: 999,
                padding: '6px 14px',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <Search size={15} className="text-white/40" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search stories…"
                className="theme-input bg-transparent text-sm text-white focus:outline-none w-32 sm:w-52"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  onSearch('');
                }}
                className="text-white/40 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Search articles"
            >
              <Search size={18} />
            </button>
          )}

        </div>
      </div>
    </Motion.header>
  );
}


// ─────────────────────────────────────────────────────────────
// FEATURED HERO
// ─────────────────────────────────────────────────────────────

function FeaturedHero({ post, onPostClick, categoryName }) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);

  if (!post) return null;

  const category = categoryName || 'Story';

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: 'min(78vh, 700px)',
        minHeight: 460,
      }}
    >
      <Motion.div className="absolute inset-0" style={{ y: heroY }}>
        <img
          src={post.featuredImage || post.imageUrl || post.image_url}
          alt={post.imageAlt || post.title}
          width="1600"
          height="900"
          className="w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
          style={{
            objectPosition: 'center 40%',
            transform: 'scale(1.03)',
            transformOrigin: 'center center',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(5,5,7,0.82) 0%, rgba(5,5,7,0.52) 28%, rgba(5,5,7,0.18) 100%)',
          }}
        />
      </Motion.div>

      <div className="absolute inset-0 flex items-end px-5 pb-8 sm:px-8 lg:px-12">
        <div className="max-w-5xl w-full">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
              Featured · {category}
            </p>

            <h1
              className="mb-5 font-black leading-none text-white"
              style={{
                fontFamily: '"Bebas Neue", Impact, sans-serif',
                fontSize: 'clamp(2.8rem, 6vw, 6rem)',
                letterSpacing: '-0.04em',
              }}
            >
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mb-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                {post.excerpt}
              </p>
            )}

            <div className="mb-8 flex flex-wrap items-center gap-3 text-xs text-white/60 sm:text-sm">
              <span className="font-semibold text-white/80">{post.author || 'Editorial Desk'}</span>
              <span>·</span>
              <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently published'}</span>
              <span>·</span>
              <span>{post.readTime || '6 min read'}</span>
            </div>

            <button
              onClick={() => onPostClick(post)}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-all hover:scale-[1.02]"
              style={{ background: '#22d3ee', color: '#000' }}
            >
              Read Story <span aria-hidden="true">→</span>
            </button>
          </Motion.div>
        </div>
      </div>
    </section>
  );
}


// ─────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────

function getCategoryName(post, categories = []) {
  if (post?.category) return post.category;
  if (post?.categoryId) {
    const match = categories.find((cat) => cat.id === post.categoryId);
    if (match) return match.name;
  }
  return 'Story';
}

function stripHtml(html = '') {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function HomePage() {
  const { publishedPosts = [], categories = [], featuredPost } = useCms();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categoryList = useMemo(() => ['All', ...categories.map((cat) => cat.name)], [categories]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return publishedPosts.filter((post) => {
      const categoryName = getCategoryName(post, categories);
      const matchesCategory = activeCategory === 'All' || categoryName === activeCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      const haystack = [
        post.title,
        post.excerpt,
        stripHtml(post.content),
        categoryName,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [activeCategory, categories, publishedPosts, searchQuery]);

  const heroPost = featuredPost || publishedPosts[0] || null;
  const secondaryPosts = filteredPosts.filter((post) => post.id !== heroPost?.id).slice(0, 3);
  const primarySecondary = secondaryPosts[0] || null;
  const stackedSecondary = secondaryPosts.slice(1, 3);
  const latestPosts = filteredPosts.filter((post) => post.id !== heroPost?.id);
  const openPost = (post) => post?.slug ? navigate(`/article/${post.slug}`) : setSelectedPost(post);

  if (selectedPost) {
    return (
      <>
        <PublicHeader searchQuery={searchQuery} onSearch={setSearchQuery} categories={categories} />
        <div className="pt-24">
          <PostDetail
            post={selectedPost}
            onBack={() => setSelectedPost(null)}
            onPostClick={setSelectedPost}
            publishedPosts={publishedPosts}
            categories={categories}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <SeoMeta />
      <PublicHeader searchQuery={searchQuery} onSearch={setSearchQuery} categories={categories} />

      <main className="public-home pb-20 pt-24">
        {heroPost && (
          <section className="px-4 pb-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d12] shadow-[0_30px_80px_rgba(17,24,39,0.42)]">
              <FeaturedHero
                post={heroPost}
                onPostClick={openPost}
                categoryName={getCategoryName(heroPost, categories)}
              />
            </div>
          </section>
        )}

        <AdSlot label="Homepage advertisement" variant="banner" className="mx-auto mb-8 max-w-7xl" />

        {(primarySecondary || stackedSecondary.length > 0) && (
          <section className="px-4 pb-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              {primarySecondary && (
                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0b0b10] p-3">
                  <BlogPostCard
                    post={primarySecondary}
                    onClick={() => openPost(primarySecondary)}
                    featured={true}
                    compact={false}
                  />
                </div>
              )}

              <div className="grid gap-6">
                {stackedSecondary.map((post) => (
                  <div key={post.id} className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0b0b10] p-3">
                    <BlogPostCard
                      post={post}
                      onClick={() => openPost(post)}
                      featured={false}
                      compact={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <AdSlot label="Between sections advertisement" variant="banner" className="mx-auto mb-8 max-w-7xl" />

        <section id="latest" className="px-4 pt-10 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Latest</p>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>
                  Latest Stories
                </h2>
              </div>

              <div id="categories" className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
                {categoryList.map((category) => category === 'All' ? (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className="whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-all"
                    style={{
                      borderColor: activeCategory === category ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.08)',
                      background: activeCategory === category ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.02)',
                      color: activeCategory === category ? '#22d3ee' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {category}
                  </button>
                ) : (
                  <Link
                    key={category}
                    to={`/category/${categories.find((item) => item.name === category)?.slug || category.toLowerCase()}`}
                    className="whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
              <BlogGallery
                onPostClick={openPost}
                searchQuery={searchQuery}
                publishedPosts={latestPosts}
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />

              <aside className="hidden xl:block">
                <AdSlot label="Sidebar advertisement" variant="sidebar" className="mb-6 rounded-2xl border-x" />
                <div className="rounded-[24px] border border-white/10 bg-[#0b0b10] p-5">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Trending</h3>
                  </div>

                  <div className="space-y-4">
                    {publishedPosts.slice(0, 5).map((post) => {
                      const categoryName = getCategoryName(post, categories);
                      return (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => openPost(post)}
                          className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-2 text-left transition-colors hover:bg-white/[0.04]"
                        >
                          <img
                            src={post.featuredImage || post.imageUrl}
                            alt={post.title}
                            width="80"
                            height="64"
                            className="h-16 w-20 rounded-xl object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">{categoryName}</p>
                            <p className="line-clamp-2 text-sm font-semibold text-white/90">{post.title}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-5">
                    <h4 className="mb-3 text-[11px] font-black uppercase tracking-[0.24em] text-white/40">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/category/${cat.slug}`}
                          className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
            <NewsletterSignup />
          </div>
        </section>
      </main>
      <PublicFooter categories={categories} />
    </>
  );
}

function ArticlePage() {
  const { slug, categorySlug } = useParams();
  const navigate = useNavigate();
  const { publishedPosts = [], categories = [] } = useCms();
  const [searchQuery, setSearchQuery] = useState('');
  const post = publishedPosts.find((item) => item.slug === slug || item.slug === categorySlug);

  if (!post) {
    return <main className="min-h-screen px-6 pt-32 text-center"><h1 className="text-4xl font-black text-white">Story not found</h1><Link to="/" className="mt-5 inline-block text-cyan-300">Return home</Link></main>;
  }

  return <>
    <SeoMeta post={post} />
    <PublicHeader searchQuery={searchQuery} onSearch={setSearchQuery} categories={categories} />
    <div className="pt-24"><PostDetail post={post} onBack={() => navigate('/')} onPostClick={(related) => navigate(`/article/${related.slug}`)} publishedPosts={publishedPosts} categories={categories} /></div>
    <PublicFooter categories={categories} />
  </>;
}


// ─────────────────────────────────────────────────────────────
// ADMIN GUARD
// ─────────────────────────────────────────────────────────────

function AdminGuard({ children }) {
  const { isAdmin, authUser, loading } = useCms();

  if (loading) return null;

  if (!authUser) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}


// ─────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────

export default function App() {
  const { theme } = useTheme();

  return (
    <CmsProvider>
      <BrowserRouter>
        <div
          className={`app-shell ${theme}`}
          style={{
            background: theme === 'light' ? '#f5f6f8' : '#050507',
            color: theme === 'light' ? '#172033' : '#f0f0f5',
            minHeight: '100vh',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          <Routes>

            {/* PUBLIC */}
            <Route
              path="/"
              element={<HomePage />}
            />

            <Route path="/account" element={<AccountPage />} />
            <Route path="/advertise" element={<AdvertisePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

            <Route path="/:categorySlug" element={<CategoryPage />} />
            <Route path="/:categorySlug/:slug" element={<ArticlePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/article/:slug" element={<ArticlePage />} />

            {/* ADMIN LOGIN */}
            <Route
              path="/admin/login"
              element={<AdminLogin />}
            />

            {/* ADMIN DASHBOARD */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />

            {/* ALL POSTS */}
            <Route
              path="/admin/posts"
              element={
                <AdminGuard>
                  <AdminPosts />
                </AdminGuard>
              }
            />

            {/* ⭐ CREATE POST */}
            <Route
              path="/admin/posts/new"
              element={
                <AdminGuard>
                  <PostEditor />
                </AdminGuard>
              }
            />

            {/* EDIT POST */}
            <Route
              path="/admin/posts/:id"
              element={
                <AdminGuard>
                  <PostEditor />
                </AdminGuard>
              }
            />

            {/* DRAFTS */}
            <Route
              path="/admin/drafts"
              element={
                <AdminGuard>
                  <AdminPosts filterStatus="draft" />
                </AdminGuard>
              }
            />

            {/* PUBLISHED */}
            <Route
              path="/admin/published"
              element={
                <AdminGuard>
                  <AdminPosts filterStatus="published" />
                </AdminGuard>
              }
            />

            {/* MEDIA */}
            <Route
              path="/admin/media"
              element={
                <AdminGuard>
                  <AdminMedia />
                </AdminGuard>
              }
            />

            {/* CATEGORIES */}
            <Route
              path="/admin/categories"
              element={
                <AdminGuard>
                  <AdminCategories />
                </AdminGuard>
              }
            />

            {/* SETTINGS */}
            <Route
              path="/admin/settings"
              element={
                <AdminGuard>
                  <AdminSettings />
                </AdminGuard>
              }
            />

            <Route
              path="/admin/comments"
              element={
                <AdminGuard>
                  <AdminComments />
                </AdminGuard>
              }
            />

            {/* UNKNOWN URL */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>
        </div>
        <CookieConsent />
      </BrowserRouter>
    </CmsProvider>
  );
}