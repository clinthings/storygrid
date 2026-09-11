import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCms } from '../lib/useCms';
import BlogPostCard from './BlogPostCard';
import PostDetail from './PostDetail';
import AdSlot from './AdSlot';
import NewsletterSignup from './NewsletterSignup';
import PublicFooter from './PublicFooter';

function categoryName(post, categories) {
    if (post.category) return post.category;
    return categories.find((category) => category.id === post.categoryId)?.name || 'Story';
}

export default function CategoryPage({ searchQuery = '' }) {
    const params = useParams();
    const categorySlug = params.slug || params.categorySlug;
    const { categories, publishedPosts } = useCms();
    const [selectedPost, setSelectedPost] = useState(null);
    const category = categories.find((item) => item.slug === categorySlug || item.name.toLowerCase() === String(categorySlug || '').toLowerCase());
    const posts = useMemo(() => publishedPosts.filter((post) => post.categoryId === category?.id || categoryName(post, categories) === category?.name), [category, categories, publishedPosts]);
    const filtered = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return posts;
        return posts.filter((post) => [post.title, post.excerpt, post.content, category?.name].join(' ').toLowerCase().includes(query));
    }, [category?.name, posts, searchQuery]);
    const hero = filtered[0];

    if (selectedPost) {
        const backUrl = category?.slug ? `/${category.slug}` : '/';
        return <>
            <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#050507]/90 px-5 py-4 backdrop-blur-xl">
                <Link to={backUrl} className="text-sm font-bold text-cyan-300">← {category?.name || 'Category'}</Link>
                <span className="text-xs font-black tracking-[0.2em] text-white">STORY<span className="text-cyan-300">GRID</span></span>
            </div>
            <div className="pt-20"><PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} onPostClick={setSelectedPost} publishedPosts={publishedPosts} categories={categories} /></div>
        </>;
    }

    if (!category) return <main className="min-h-screen px-6 pb-20 pt-32 text-center"><h1 className="text-4xl font-black text-white">Category not found</h1><Link to="/" className="mt-5 inline-block text-cyan-300">Return home</Link></main>;

    return <main className="min-h-screen pb-20 pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <Link to="/" className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">← StoryGrid</Link>
            <header className="mt-6 border-b border-white/10 pb-8"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Channel</p><h1 className="mt-2 text-6xl font-black text-white" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>{category.name}</h1>{category.description && <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/55">{category.description}</p>}</header>
            <AdSlot label={`${category.name} advertisement`} variant="banner" className="my-8" />
            {hero ? <section className="grid gap-6 border-b border-white/10 pb-10 lg:grid-cols-[1.2fr_0.8fr]"><button type="button" onClick={() => setSelectedPost(hero)} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10] text-left"><img src={hero.featuredImage || hero.imageUrl} alt={hero.imageAlt || hero.title} width="1600" height="900" fetchPriority="high" decoding="async" className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" /><div className="p-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Latest {category.name} story</p><h2 className="mt-3 text-3xl font-black text-white">{hero.title}</h2><p className="mt-3 text-sm leading-relaxed text-white/55">{hero.excerpt}</p></div></button><div className="flex flex-col justify-center"><p className="text-sm leading-relaxed text-white/45">The latest reporting, ideas, and perspectives from the {category.name} desk.</p><p className="mt-5 text-xs text-white/35">{filtered.length} published {filtered.length === 1 ? 'story' : 'stories'}</p></div></section> : <p className="py-20 text-center text-white/40">No published stories in this category yet.</p>}
            <section className="pt-10"><div className="mb-6 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">The desk</p><h2 className="mt-2 text-3xl font-black text-white" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>More {category.name}</h2></div></div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.slice(1).map((post) => <BlogPostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />)}</div></section>
            <NewsletterSignup />
        </div>
        <PublicFooter categories={categories} />
    </main>;
}
