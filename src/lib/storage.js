// src/lib/storage.js
// Persistent CMS storage using localStorage.
// Architected for easy migration to Supabase/Firebase later.

const POSTS_KEY = 'storygrid_posts';
const CATEGORIES_KEY = 'storygrid_categories';
const MEDIA_KEY = 'storygrid_media';
const EXPANDED_POSTS_KEY = 'storygrid_expanded_posts_v1';
const EXPANDED_IMAGES_KEY = 'storygrid_expanded_images_v1';

// ── Helpers ──────────────────────────────────────────────────────────────────

function uuid() {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readJSON(key, fallback = []) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// ── Default Categories ────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
    { id: 'cat-technology', name: 'Technology', slug: 'technology', description: 'AI, software, and digital innovation.' },
    { id: 'cat-education', name: 'Education', slug: 'education', description: 'Learning, schools, and skills development.' },
    { id: 'cat-business', name: 'Business', slug: 'business', description: 'Entrepreneurship and the digital economy.' },
    { id: 'cat-productivity', name: 'Productivity', slug: 'productivity', description: 'Focus, habits, and effective workflows.' },
    { id: 'cat-future', name: 'Future', slug: 'future', description: 'What comes next in work and society.' },
    { id: 'cat-sports', name: 'Sports', slug: 'sports', description: 'Football, basketball, tennis, and the stories behind competition.' },
];

// No demo or legacy post seed data is created here. Categories remain available for the CMS,
// but the app must source posts from Supabase when it is configured.
export function seedIfEmpty() {
    const existingCategories = readJSON(CATEGORIES_KEY);
    const categories = existingCategories.length === 0
        ? DEFAULT_CATEGORIES
        : [...existingCategories, ...DEFAULT_CATEGORIES.filter(defaultCategory => !existingCategories.some(category => category.slug === defaultCategory.slug))];
    writeJSON(CATEGORIES_KEY, categories);

    if (readJSON(POSTS_KEY).length === 0) {
        writeJSON(POSTS_KEY, []);
    }
}

// ── Reading Time ──────────────────────────────────────────────────────────────

export function calcReadingTime(htmlContent) {
    if (!htmlContent) return '1 min read';
    const text = htmlContent.replace(/<[^>]+>/g, ' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
}

// ── Slug Generation ───────────────────────────────────────────────────────────

export function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ── Categories CRUD ───────────────────────────────────────────────────────────

export const categoryService = {
    getAll() {
        return readJSON(CATEGORIES_KEY, []);
    },
    getById(id) {
        return this.getAll().find(c => c.id === id) || null;
    },
    getBySlug(slug) {
        return this.getAll().find(c => c.slug === slug) || null;
    },
    create(data) {
        const categories = this.getAll();
        const newCat = { id: uuid(), createdAt: new Date().toISOString(), ...data };
        writeJSON(CATEGORIES_KEY, [...categories, newCat]);
        return newCat;
    },
    update(id, data) {
        const categories = this.getAll().map(c => c.id === id ? { ...c, ...data } : c);
        writeJSON(CATEGORIES_KEY, categories);
        return categories.find(c => c.id === id);
    },
    delete(id) {
        const categories = this.getAll().filter(c => c.id !== id);
        writeJSON(CATEGORIES_KEY, categories);
    },
};

// ── Posts CRUD ────────────────────────────────────────────────────────────────

export const postService = {
    getAll() {
        return readJSON(POSTS_KEY, []);
    },
    getById(id) {
        return this.getAll().find(p => p.id === id) || null;
    },
    getBySlug(slug) {
        return this.getAll().find(p => p.slug === slug) || null;
    },
    getPublished() {
        return this.getAll()
            .filter(p => p.status === 'published')
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    },
    getFeatured() {
        return this.getPublished().filter(p => p.isFeatured).slice(0, 1)[0] || null;
    },
    getByCategory(categoryId) {
        return this.getPublished().filter(p => p.categoryId === categoryId);
    },
    getRelated(postId, categoryId, limit = 3) {
        return this.getPublished()
            .filter(p => p.id !== postId && p.categoryId === categoryId)
            .slice(0, limit);
    },
    search(query) {
        const q = query.toLowerCase();
        return this.getPublished().filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.excerpt.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q)
        );
    },
    create(data) {
        const posts = this.getAll();
        const now = new Date().toISOString();
        const newPost = {
            id: uuid(),
            status: 'draft',
            isFeatured: false,
            publishedAt: null,
            createdAt: now,
            updatedAt: now,
            ...data,
        };
        writeJSON(POSTS_KEY, [...posts, newPost]);
        return newPost;
    },
    update(id, data) {
        const posts = this.getAll().map(p =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
        );
        writeJSON(POSTS_KEY, posts);
        return posts.find(p => p.id === id);
    },
    publish(id) {
        return this.update(id, {
            status: 'published',
            publishedAt: new Date().toISOString(),
        });
    },
    unpublish(id) {
        return this.update(id, { status: 'draft' });
    },
    setFeatured(id, featured) {
        // Unset other featured posts first (only 1 featured at a time)
        if (featured) {
            const posts = this.getAll().map(p => ({ ...p, isFeatured: p.id === id ? true : false }));
            writeJSON(POSTS_KEY, posts.map(p => ({ ...p, updatedAt: new Date().toISOString() })));
            return this.getById(id);
        }
        return this.update(id, { isFeatured: false });
    },
    delete(id) {
        const posts = this.getAll().filter(p => p.id !== id);
        writeJSON(POSTS_KEY, posts);
    },
};

// ── Media Library ─────────────────────────────────────────────────────────────

export const mediaService = {
    getAll() {
        return readJSON(MEDIA_KEY, []);
    },
    add(item) {
        const media = this.getAll();
        const newItem = { id: uuid(), uploadedAt: new Date().toISOString(), ...item };
        writeJSON(MEDIA_KEY, [...media, newItem]);
        return newItem;
    },
    delete(id) {
        const media = this.getAll().filter(m => m.id !== id);
        writeJSON(MEDIA_KEY, media);
    },
    // Persist a base64 data URL from the file reader
    async fromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const item = this.add({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: reader.result, // base64 data URL
                });
                resolve(item);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
};

// ── Authentication boundary ───────────────────────────────────────────────────
// Admin authentication is handled by Supabase Auth and enforced by database RLS.
// Local browser auth is intentionally not used for production security.

export const authService = {
    login() {
        throw new Error('Admin authentication is handled by Supabase Auth. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    },
    logout() {
        return undefined;
    },
    isAuthenticated() {
        return false;
    },
    getUser() {
        return null;
    },
};
