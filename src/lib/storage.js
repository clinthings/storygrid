// src/lib/storage.js
// Persistent CMS storage using localStorage.
// Architected for easy migration to Supabase/Firebase later.

const POSTS_KEY = 'storygrid_posts';
const CATEGORIES_KEY = 'storygrid_categories';
const MEDIA_KEY = 'storygrid_media';

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
];

// ── Seed initial data if storage is empty ─────────────────────────────────────

export function seedIfEmpty() {
    // Seed categories
    if (readJSON(CATEGORIES_KEY).length === 0) {
        writeJSON(CATEGORIES_KEY, DEFAULT_CATEGORIES);
    }

    // Seed posts from the hardcoded dataset
    if (readJSON(POSTS_KEY).length === 0) {
        const now = new Date().toISOString();
        const seedPosts = [
            {
                id: uuid(),
                title: "The AI Revolution Is Already Here — What Happens Next?",
                slug: "ai-revolution-already-here-what-happens-next",
                excerpt: "Artificial intelligence is moving from a futuristic idea into an everyday technology. From education and business to healthcare and entertainment, AI is changing how people work, learn, and solve problems.",
                content: `<p>Artificial intelligence is no longer something that belongs only in science-fiction movies. It has become part of everyday life, quietly influencing the way people search for information, communicate, create content, analyze data, and make decisions.</p><p>The rapid development of AI tools has created opportunities for individuals and businesses to accomplish tasks that once required significant amounts of time and resources.</p><p>However, the rise of AI also raises important questions. What happens to traditional jobs? How should schools teach students in an environment where information is instantly available?</p><p>The answer may not be to resist artificial intelligence, but to learn how to work alongside it.</p><p>People who understand how to use AI effectively may have an advantage in the future. At the same time, skills such as critical thinking, creativity, communication, and problem-solving remain essential.</p><p>The AI revolution is therefore not simply about machines becoming smarter. It is about humans learning how to use increasingly powerful tools.</p><p><strong>The next chapter of technology is already being written.</strong></p>`,
                categoryId: 'cat-technology',
                author: "Segun Olubanjo",
                featuredImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1600",
                imageAlt: "Artificial Intelligence concept",
                imageCaption: "",
                status: "published",
                isFeatured: true,
                publishedAt: "2026-08-10T00:00:00.000Z",
                createdAt: now,
                updatedAt: now,
            },
            {
                id: uuid(),
                title: "Why Learning Skills May Matter More Than Memorizing Information",
                slug: "learning-skills-vs-memorizing-information",
                excerpt: "The internet has made information easier to access than ever before. In today's world, knowing where to find reliable information — and what to do with it — can be just as important as memorizing facts.",
                content: `<p>For generations, education has often focused heavily on remembering information. Students learn definitions, formulas, dates, theories, and explanations before reproducing them during examinations.</p><p>But the world students are entering is changing. Information is now available almost instantly.</p><p>This does not make education less important. Instead, it changes what valuable education should look like.</p><p>Students increasingly need the ability to ask good questions, evaluate information, solve problems, communicate clearly, collaborate with others, and apply knowledge to real situations.</p><p>This is why <strong>learning how to learn</strong> has become such an important skill.</p><p>Education should therefore not only prepare students to pass examinations. It should prepare them to face problems that do not come with examination instructions.</p>`,
                categoryId: 'cat-education',
                author: "Segun Olubanjo",
                featuredImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1600",
                imageAlt: "Students learning in a modern environment",
                imageCaption: "",
                status: "published",
                isFeatured: false,
                publishedAt: "2026-08-09T00:00:00.000Z",
                createdAt: now,
                updatedAt: now,
            },
            {
                id: uuid(),
                title: "The New Digital Economy: Why Small Businesses Are Going Online",
                slug: "new-digital-economy-small-businesses-going-online",
                excerpt: "A small business no longer needs a massive physical office to reach customers. Social media, online marketplaces, digital payments, and websites are creating new opportunities for entrepreneurs.",
                content: `<p>The internet has changed what it means to run a business.</p><p>In the past, a small business often depended heavily on its physical location. Today, a business can reach potential customers far beyond its immediate neighborhood.</p><p>This transformation has created what is commonly described as the <strong>digital economy</strong>.</p><p>One of its biggest advantages is accessibility. Someone with a useful skill and an internet connection can potentially create an online service and begin reaching customers.</p><p>But going online does not automatically guarantee success. Businesses still need strong products, good customer service, and reliable communication.</p><p>The opportunity is there. The challenge is learning how to use it.</p>`,
                categoryId: 'cat-business',
                author: "Segun Olubanjo",
                featuredImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1600",
                imageAlt: "Small business digital presence",
                imageCaption: "",
                status: "published",
                isFeatured: false,
                publishedAt: "2026-08-08T00:00:00.000Z",
                createdAt: now,
                updatedAt: now,
            },
            {
                id: uuid(),
                title: "The Problem With Trying to Be Productive All Day",
                slug: "problem-with-trying-to-be-productive-all-day",
                excerpt: "Productivity is not about filling every minute with work. Sometimes doing fewer things with greater focus produces better results than constantly staying busy.",
                content: `<p>Being busy and being productive are not the same thing.</p><p>It is possible to spend an entire day answering messages, checking notifications, and attending meetings without making meaningful progress.</p><p>Modern technology has made this problem worse. Notifications constantly compete for attention.</p><p>A better approach is to identify the tasks that matter most and give them focused attention.</p><p>Instead of creating a list of twenty tasks, identify three important priorities for the day.</p><p>Rest is also part of productivity. The goal should not be to remain busy from morning until night. The goal should be to use time intentionally.</p>`,
                categoryId: 'cat-productivity',
                author: "Segun Olubanjo",
                featuredImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1600",
                imageAlt: "Focused work environment",
                imageCaption: "",
                status: "published",
                isFeatured: false,
                publishedAt: "2026-08-07T00:00:00.000Z",
                createdAt: now,
                updatedAt: now,
            },
            {
                id: uuid(),
                title: "What Will Work Look Like in the Next Ten Years?",
                slug: "what-will-work-look-like-next-ten-years",
                excerpt: "Technology is changing the workplace faster than many people expected. The next decade could bring new careers, new working arrangements, and a growing demand for adaptable skills.",
                content: `<p>The workplace of the future may look very different from the workplace many people know today.</p><p>Remote collaboration, artificial intelligence, automation, and rapidly changing industries are already influencing how organizations operate.</p><p>But technological change does not necessarily mean that humans will become irrelevant. Instead, the nature of human work may continue to evolve.</p><p>Jobs that require creativity, communication, leadership, empathy, and complex decision-making may become increasingly valuable.</p><p>The ability to learn may also become one of the most important professional advantages. A skill that is valuable today may become less important tomorrow.</p><p><strong>The future of work will probably belong to people who can learn, adapt, and apply new knowledge quickly.</strong></p>`,
                categoryId: 'cat-future',
                author: "Segun Olubanjo",
                featuredImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1600",
                imageAlt: "Future workspace with technology",
                imageCaption: "",
                status: "published",
                isFeatured: false,
                publishedAt: "2026-08-06T00:00:00.000Z",
                createdAt: now,
                updatedAt: now,
            },
        ];
        writeJSON(POSTS_KEY, seedPosts);
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

// ── Admin Auth ────────────────────────────────────────────────────────────────
// Simple but non-trivial: credentials live in .env, not in the component.
// To configure: VITE_ADMIN_USER and VITE_ADMIN_PASS in your .env file.
// This is a client-side gate only. To upgrade to real auth, replace this service
// with a Supabase/Firebase auth call.

const SESSION_KEY = 'storygrid_admin_session';

export const authService = {
    ADMIN_USER: import.meta.env.VITE_ADMIN_USER || 'admin',
    ADMIN_PASS: import.meta.env.VITE_ADMIN_PASS || 'storygrid2026',

    login(username, password) {
        if (username === this.ADMIN_USER && password === this.ADMIN_PASS) {
            const session = { username, loggedAt: new Date().toISOString() };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return true;
        }
        return false;
    },
    logout() {
        sessionStorage.removeItem(SESSION_KEY);
    },
    isAuthenticated() {
        return !!sessionStorage.getItem(SESSION_KEY);
    },
    getUser() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY));
        } catch {
            return null;
        }
    },
};
