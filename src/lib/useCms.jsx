/* eslint-disable react-refresh/only-export-components */
// src/lib/useCms.js
// Central CMS context providing posts, categories, and auth state to all components.

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { postService, categoryService, mediaService, authService, seedIfEmpty } from './storage';
import { supabase, isSupabaseConfigured } from './supabase';

if (!isSupabaseConfigured) {
    seedIfEmpty();
}

const CmsContext = createContext(null);

function normalizeCategory(raw = {}) {
    return {
        id: raw.id || raw.slug,
        name: raw.name || 'Untitled',
        slug: raw.slug || String(raw.name || 'untitled').toLowerCase().replace(/\s+/g, '-'),
        description: raw.description || '',
        seoTitle: raw.seo_title || raw.seoTitle || raw.name || 'StoryGrid',
        seoDescription: raw.seo_description || raw.seoDescription || raw.description || '',
        parentId: raw.parent_id || raw.parentId || null,
    };
}

export function normalizeFeaturedValue(raw = {}) {
    return Boolean(raw.is_featured ?? raw.featured ?? raw.isFeatured ?? false);
}

export function sortPublishedPosts(posts = []) {
    return [...posts]
        .filter((post) => post.status === 'published')
        .sort((a, b) => {
            const featuredDelta = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
            if (featuredDelta !== 0) return featuredDelta;
            return new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt);
        });
}

function normalizePost(raw = {}) {
    return {
        id: raw.id,
        title: raw.title || 'Untitled Story',
        slug: raw.slug || raw.id,
        excerpt: raw.excerpt || '',
        content: raw.content || '',
        categoryId: raw.category_id || raw.categoryId || raw.category || null,
        category: raw.category || raw.category_name || null,
        author: raw.author || 'StoryGrid Editorial Desk',
        featuredImage: raw.featured_image || raw.featuredImage || raw.image_url || raw.imageUrl || '',
        imageAlt: raw.image_alt || raw.imageAlt || '',
        imageCaption: raw.image_caption || raw.imageCaption || '',
        status: raw.status || 'draft',
        isFeatured: normalizeFeaturedValue(raw),
        isSponsored: Boolean(raw.is_sponsored ?? raw.isSponsored),
        publishedAt: raw.published_at || raw.publishedAt || null,
        createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
        updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
        readTime: raw.read_time || raw.readTime || null,
    };
}

function normalizeMedia(raw = {}) {
    return {
        id: raw.id,
        name: raw.original_name || raw.name || raw.storage_path?.split('/').pop() || 'Media asset',
        type: raw.mime_type || raw.type || '',
        size: raw.file_size || raw.size || 0,
        url: raw.url || '',
        storagePath: raw.storage_path || raw.storagePath || '',
        uploadedAt: raw.created_at || raw.uploadedAt || new Date().toISOString(),
    };
}

function toDbPost(data) {
    return {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        content: data.content || '',
        category_id: data.categoryId || null,
        category: data.category || null,
        author: data.author || 'StoryGrid Editorial Desk',
        author_id: data.authorId || null,
        featured_image: data.featuredImage || null,
        image_url: data.featuredImage || null,
        image_alt: data.imageAlt || '',
        image_caption: data.imageCaption || '',
        status: data.status || 'draft',
        is_featured: Boolean(data.isFeatured ?? data.featured),
        is_sponsored: Boolean(data.isSponsored),
        published_at: data.publishedAt || null,
    };
}

async function updateAdminRoleState(setIsAdmin, setAuthUser) {
    if (!isSupabaseConfigured) {
        setAuthUser(null);
        setIsAdmin(authService.isAuthenticated());
        return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        setAuthUser(null);
        setIsAdmin(false);
        return;
    }
    setAuthUser(user);

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    setIsAdmin(!profileError && profile?.role === 'admin');
}

export function CmsProvider({ children }) {
    const [posts, setPosts] = useState(() => isSupabaseConfigured ? [] : postService.getAll().map(normalizePost));
    const [categories, setCategories] = useState(() => isSupabaseConfigured ? [] : categoryService.getAll().map(normalizeCategory));
    const [media, setMedia] = useState(() => isSupabaseConfigured ? [] : mediaService.getAll());
    const [isAdmin, setIsAdmin] = useState(false);
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);

    const refreshFromLocal = useCallback(() => {
        setPosts(postService.getAll().map(normalizePost));
        setCategories(categoryService.getAll().map(normalizeCategory));
        setMedia(mediaService.getAll());
    }, []);

    const refreshFromSupabase = useCallback(async () => {
        if (!isSupabaseConfigured) {
            refreshFromLocal();
            setLoading(false);
            return;
        }

        const [categoriesResult, postsResult, mediaResult] = await Promise.all([
            supabase.from('categories').select('*').order('name', { ascending: true }),
            supabase.from('posts').select('*').order('published_at', { ascending: false }),
            supabase.from('media_assets').select('*').order('created_at', { ascending: false }),
        ]);

        if (categoriesResult.error) {
            console.error('Category fetch failed:', categoriesResult.error);
        }
        if (postsResult.error) {
            console.error('Post fetch failed:', postsResult.error);
        }
        if (mediaResult.error) {
            console.error('Media fetch failed:', mediaResult.error);
        }

        const normalizedCategories = (categoriesResult.data || []).map(normalizeCategory);
        const normalizedPosts = (postsResult.data || []).map(normalizePost);
        const normalizedMedia = (mediaResult.data || []).map(normalizeMedia);

        setCategories(normalizedCategories);
        setPosts(normalizedPosts);
        setMedia(normalizedMedia);

        if (typeof window !== 'undefined' && isSupabaseConfigured) {
            localStorage.setItem('storygrid_categories', JSON.stringify(categoriesResult.data || []));
            localStorage.setItem('storygrid_posts', JSON.stringify(postsResult.data || []));
            localStorage.setItem('storygrid_media', JSON.stringify(mediaResult.data || []));
        }

        setLoading(false);
    }, [refreshFromLocal]);

    useEffect(() => {
        let isMounted = true;

        const hydrate = async () => {
            if (!isMounted) return;
            await refreshFromSupabase();
            await updateAdminRoleState((next) => {
                if (isMounted) { setIsAdmin(next); setAuthLoading(false); }
            }, setAuthUser);
        };

        hydrate();

        if (!isSupabaseConfigured) return undefined;

        const { data: listener } = supabase.auth.onAuthStateChange(async () => {
            await updateAdminRoleState((next) => {
                if (isMounted) { setIsAdmin(next); setAuthLoading(false); }
            }, setAuthUser);
        });

        return () => {
            isMounted = false;
            listener?.subscription.unsubscribe();
        };
    }, [refreshFromSupabase]);

    const login = useCallback(async (email, password) => {
        if (!isSupabaseConfigured) {
            setIsAdmin(false);
            throw new Error('Supabase is not configured.');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: String(email).trim(),
            password,
        });

        if (error) {
            console.error('Admin sign-in failed:', error.message);
            setIsAdmin(false);
            throw error;
        }

        if (!data.user) {
            setIsAdmin(false);
            throw new Error('Supabase authenticated no user.');
        }
        setAuthUser(data.user);

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

        if (profileError) {
            setIsAdmin(false);
            throw new Error(`Could not load your profile: ${profileError.message}`);
        }
        if (!profileData) {
            setIsAdmin(false);
            throw new Error('Your Supabase account has no profile. Ask an administrator to create one.');
        }
        if (profileData.role !== 'admin') {
            setIsAdmin(false);
            throw new Error('This account is authenticated but is not an administrator.');
        }
        setIsAdmin(true);
        return true;
    }, []);

    const logout = useCallback(async () => {
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        } else {
            authService.logout();
        }
        setIsAdmin(false);
        setAuthUser(null);
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        await refreshFromSupabase();
    }, [refreshFromSupabase]);

    const createPost = useCallback(async (data) => {
        if (isSupabaseConfigured) {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error('You must be authenticated to create a post.');
            const { data: result, error } = await supabase.from('posts').insert([toDbPost({ ...data, authorId: user.id, status: data.status || 'draft' })]).select().single();
            if (error) throw error;
            await refreshFromSupabase();
            return normalizePost(result);
        }

        const post = postService.create(data);
        refreshFromLocal();
        return post;
    }, [refreshFromLocal, refreshFromSupabase]);

    const updatePost = useCallback(async (id, data) => {
        if (isSupabaseConfigured) {
            const { data: result, error } = await supabase.from('posts').update(toDbPost({ ...data, status: data.status || 'draft' })).eq('id', id).select().single();
            if (error) throw error;
            await refreshFromSupabase();
            return normalizePost(result);
        }

        const post = postService.update(id, data);
        refreshFromLocal();
        return post;
    }, [refreshFromLocal, refreshFromSupabase]);

    const publishPost = useCallback(async (id) => {
        if (isSupabaseConfigured) {
            const { data: result, error } = await supabase
                .from('posts')
                .update({
                    status: 'published',
                    published_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            await refreshFromSupabase();
            try {
                await supabase.functions.invoke('send-new-post-notification', { body: { postId: id } });
            } catch (notificationError) {
                console.error('New story notification failed:', notificationError);
            }
            return normalizePost(result);
        }

        const post = postService.publish(id);
        refreshFromLocal();
        return post;
    }, [refreshFromLocal, refreshFromSupabase]);

    const unpublishPost = useCallback(async (id) => {
        if (isSupabaseConfigured) {
            const { data: result, error } = await supabase.from('posts').update({ status: 'draft' }).eq('id', id).select().single();
            if (error) throw error;
            await refreshFromSupabase();
            return normalizePost(result);
        }

        const post = postService.unpublish(id);
        refreshFromLocal();
        return post;
    }, [refreshFromLocal, refreshFromSupabase]);

    const deletePost = useCallback(async (id) => {
        if (isSupabaseConfigured) {
            const { error } = await supabase.from('posts').delete().eq('id', id);
            if (error) throw error;
            await refreshFromSupabase();
            return;
        }

        postService.delete(id);
        refreshFromLocal();
    }, [refreshFromLocal, refreshFromSupabase]);

    const toggleFeatured = useCallback(async (id, featured) => {
        if (isSupabaseConfigured) {
            const { data: result, error } = await supabase.from('posts').update({ is_featured: featured }).eq('id', id).select().single();
            if (error) throw error;
            await refreshFromSupabase();
            return normalizePost(result);
        }

        postService.setFeatured(id, featured);
        refreshFromLocal();
    }, [refreshFromLocal, refreshFromSupabase]);

    const createCategory = useCallback(async (data) => {
        if (isSupabaseConfigured) {
            const { data: result, error } = await supabase.from('categories').insert([{
                name: data.name,
                slug: data.slug,
                description: data.description || '',
                seo_title: data.seoTitle || data.name,
                seo_description: data.seoDescription || data.description || '',
                parent_id: data.parentId || null,
            }]).select().single();
            if (error) throw error;
            await refreshFromSupabase();
            return normalizeCategory(result);
        }

        const cat = categoryService.create(data);
        refreshFromLocal();
        return cat;
    }, [refreshFromLocal, refreshFromSupabase]);

    const updateCategory = useCallback(async (id, data) => {
        if (isSupabaseConfigured) {
            const { data: result, error } = await supabase.from('categories').update({
                name: data.name,
                slug: data.slug,
                description: data.description || '',
                seo_title: data.seoTitle || data.name,
                seo_description: data.seoDescription || data.description || '',
                parent_id: data.parentId || null,
            }).eq('id', id).select().single();
            if (error) throw error;
            await refreshFromSupabase();
            return normalizeCategory(result);
        }

        const cat = categoryService.update(id, data);
        refreshFromLocal();
        return cat;
    }, [refreshFromLocal, refreshFromSupabase]);

    const deleteCategory = useCallback(async (id) => {
        if (isSupabaseConfigured) {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            await refreshFromSupabase();
            return;
        }

        categoryService.delete(id);
        refreshFromLocal();
    }, [refreshFromLocal, refreshFromSupabase]);

    const uploadMedia = useCallback(async (file) => {
        if (isSupabaseConfigured) {
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const { data: upload, error: uploadError } = await supabase.storage.from('media').upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(upload.path);
            const { data: item, error: metadataError } = await supabase.from('media_assets').insert({
                owner_id: (await supabase.auth.getUser()).data.user?.id || null,
                storage_path: upload.path,
                url: publicUrl,
                mime_type: file.type,
                file_size: file.size,
            }).select().single();
            if (metadataError) {
                await supabase.storage.from('media').remove([upload.path]);
                throw metadataError;
            }
            const normalizedItem = normalizeMedia({ ...item, original_name: file.name });
            setMedia(current => [...current, normalizedItem]);
            return normalizedItem;
        }

        const item = await mediaService.fromFile(file);
        refreshFromLocal();
        return item;
    }, [refreshFromLocal]);

    const deleteMedia = useCallback(async (id) => {
        if (isSupabaseConfigured) {
            const item = media.find(entry => entry.id === id);
            if (item?.storagePath) {
                await supabase.storage.from('media').remove([item.storagePath]);
            }
            const { error } = await supabase.from('media_assets').delete().eq('id', id);
            if (error) throw error;
            setMedia(current => current.filter(entry => entry.id !== id));
            return;
        }

        mediaService.delete(id);
        refreshFromLocal();
    }, [media, refreshFromLocal]);

    const publishedPosts = sortPublishedPosts(posts);
    const draftPosts = posts.filter(p => p.status === 'draft');
    const featuredPost = publishedPosts.find(p => p.isFeatured) || null;

    const value = {
        posts, publishedPosts, draftPosts, featuredPost,
        categories, media, isAdmin, authUser, loading: loading || authLoading,
        login, logout,
        createPost, updatePost, publishPost, unpublishPost, deletePost, toggleFeatured, refresh,
        createCategory, updateCategory, deleteCategory,
        uploadMedia, deleteMedia,
    };

    return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
    const ctx = useContext(CmsContext);
    if (!ctx) throw new Error('useCms must be used within CmsProvider');
    return ctx;
}
