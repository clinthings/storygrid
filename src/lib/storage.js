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

const EXPANDED_STORIES = {
    technology: {
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1600',
        titles: [
            'How Nigerian Startups Are Building for the Next Million Users',
            'The Quiet Rise of African Software Teams',
            'What a Digital-First Nigeria Could Look Like',
            'Why Local Data Matters in the AI Conversation',
            'The New Tools Changing How Small Teams Work',
            'Can Technology Close Nigeria\'s Distance Problem?',
            'Inside the Push for More Homegrown Digital Products',
            'The Practical Future of Mobile Payments',
            'What Young Builders Want from Nigeria\'s Tech Ecosystem',
            'Beyond the Hype: Making Technology Useful',
        ],
    },
    education: {
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1600',
        titles: [
            'The Teachers Finding New Ways to Keep Students Curious',
            'What Better Reading Culture Could Unlock for Nigeria',
            'Learning Beyond the Classroom',
            'The Case for Practical Skills in Modern Education',
            'How Parents Can Help Children Build Better Study Habits',
            'Why Digital Access Is Now Part of the Education Debate',
            'The Students Creating Their Own Learning Networks',
            'Rethinking Success Beyond Examination Scores',
            'What Nigerian Schools Can Learn from Community Libraries',
            'The Future Belongs to Lifelong Learners',
        ],
    },
    business: {
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1600',
        titles: [
            'The Small Businesses Turning Customers into Communities',
            'Why Nigerian Entrepreneurs Are Rethinking Growth',
            'The New Rules of Trust in Online Commerce',
            'How Better Bookkeeping Can Change a Growing Business',
            'What Retailers Need to Know About the Next Consumer',
            'The Opportunity in Nigeria\'s Everyday Services',
            'How Founders Are Building More Resilient Companies',
            'The Business Case for Serving Underserved Markets',
            'What Customer Experience Looks Like on a Budget',
            'From Side Hustle to Sustainable Enterprise',
        ],
    },
    productivity: {
        image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&q=80&w=1600',
        titles: [
            'A Better Way to Plan a Demanding Week',
            'Why Your Attention Is Your Most Valuable Resource',
            'The Case for Doing Less, Better',
            'How to Build Routines That Survive Busy Seasons',
            'What Rest Teaches Us About Meaningful Work',
            'The Simple Discipline of Finishing Well',
            'How to Protect Deep Work in a Noisy World',
            'When Productivity Advice Stops Being Helpful',
            'The Value of Making Space for Reflection',
            'Small Systems That Make Everyday Work Lighter',
        ],
    },
    future: {
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1600',
        titles: [
            'The Cities Preparing for a More Connected Future',
            'What Climate Adaptation Means for Everyday Life',
            'The Careers Emerging Around New Technologies',
            'Why Adaptability May Become the Defining Skill',
            'How Culture Shapes the Future We Choose',
            'The Next Decade of Work Will Be More Human Than We Think',
            'What Nigeria Can Build in the Age of Global Teams',
            'The Questions We Should Ask Before Adopting New Tools',
            'A More Local Vision of the Global Future',
            'The Future Is Being Decided in Ordinary Places',
        ],
    },
    sports: {
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1600',
        titles: [
            'The New Generation Carrying Nigerian Football Forward',
            'Why Grassroots Academies Matter More Than Ever',
            'The Business of Building a Modern Sports Club',
            'What Makes a Great Match Report Worth Reading',
            'How Women\'s Sport Is Growing Its Audience',
            'The Coaches Changing How Young Athletes Train',
            'Football Supporters and the Culture of Belonging',
            'What Nigerian Basketball Needs for Its Next Leap',
            'The Long Road from Local Talent to Global Stage',
            'Why the Best Sports Stories Are About More Than Results',
        ],
    },
};

const EXPANDED_IMAGES = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1600',
];

function expandedImage(categoryIndex, storyIndex) {
    return EXPANDED_IMAGES[(categoryIndex * 3 + storyIndex) % EXPANDED_IMAGES.length];
}

function addExpandedStories(categories) {
    if (localStorage.getItem(EXPANDED_POSTS_KEY) === 'true') return;

    const posts = readJSON(POSTS_KEY);
    const now = Date.now();
    const expandedPosts = Object.entries(EXPANDED_STORIES).flatMap(([slug, storySet], categoryIndex) => {
        const category = categories.find(item => item.slug === slug);
        if (!category) return [];

        return storySet.titles.map((title, storyIndex) => {
            const publishedAt = new Date(now - ((categoryIndex * 10 + storyIndex) * 60 * 60 * 1000)).toISOString();
            const storySlug = slugify(title);
            return {
                id: uuid(),
                title,
                slug: storySlug,
                excerpt: `A fresh StoryGrid perspective on ${category.name.toLowerCase()}, the people shaping it, and what readers should watch next.`,
                content: `<p>${title} is part of a wider conversation about how people, communities, and institutions are changing.</p><p>Across Nigeria, practical choices are creating new possibilities. The details matter, but so do the people behind them.</p><p>Here is what to know, what to question, and what may come next.</p>`,
                categoryId: category.id,
                author: 'StoryGrid Editorial Desk',
                featuredImage: expandedImage(categoryIndex, storyIndex),
                imageAlt: `${category.name} story from StoryGrid`,
                imageCaption: '',
                status: 'published',
                isFeatured: false,
                publishedAt,
                createdAt: publishedAt,
                updatedAt: publishedAt,
            };
        });
    });

    writeJSON(POSTS_KEY, [...posts, ...expandedPosts]);
    localStorage.setItem(EXPANDED_POSTS_KEY, 'true');
}

function repairExpandedStoryImages(categories) {
    if (localStorage.getItem(EXPANDED_IMAGES_KEY) === 'true') return;

    const posts = readJSON(POSTS_KEY);
    let changed = false;
    const nextPosts = posts.map(post => {
        if (post.author !== 'StoryGrid Editorial Desk') return post;
        const categoryIndex = Object.keys(EXPANDED_STORIES).findIndex(slug => categories.some(category => category.slug === slug && category.id === post.categoryId));
        const storyIndex = categoryIndex >= 0 ? EXPANDED_STORIES[Object.keys(EXPANDED_STORIES)[categoryIndex]].titles.indexOf(post.title) : -1;
        if (categoryIndex < 0 || storyIndex < 0) return post;
        changed = true;
        return { ...post, featuredImage: expandedImage(categoryIndex, storyIndex) };
    });

    if (changed) writeJSON(POSTS_KEY, nextPosts);
    localStorage.setItem(EXPANDED_IMAGES_KEY, 'true');
}

// ── Seed initial data if storage is empty ─────────────────────────────────────

export function seedIfEmpty() {
    // Seed categories
    const existingCategories = readJSON(CATEGORIES_KEY);
    const categories = existingCategories.length === 0
        ? DEFAULT_CATEGORIES
        : [...existingCategories, ...DEFAULT_CATEGORIES.filter(defaultCategory => !existingCategories.some(category => category.slug === defaultCategory.slug))];
    writeJSON(CATEGORIES_KEY, categories);

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

    addExpandedStories(categories);
    repairExpandedStoryImages(categories);
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
