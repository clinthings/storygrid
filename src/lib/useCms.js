// src/lib/useCms.js
// Central CMS context providing posts, categories, and auth state to all components.

import React, { createContext, useContext, useState, useCallback } from 'react';
import { postService, categoryService, mediaService, authService, seedIfEmpty } from './storage';

seedIfEmpty();

const CmsContext = createContext(null);

export function CmsProvider({ children }) {
    const [posts, setPosts] = useState(() => postService.getAll());
    const [categories, setCategories] = useState(() => categoryService.getAll());
    const [media, setMedia] = useState(() => mediaService.getAll());
    const [isAdmin, setIsAdmin] = useState(() => authService.isAuthenticated());

    // ── Auth ──────────────────────────────────────────────────────────────────
    const login = useCallback((user, pass) => {
        const ok = authService.login(user, pass);
        if (ok) setIsAdmin(true);
        return ok;
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setIsAdmin(false);
    }, []);

    // ── Posts ─────────────────────────────────────────────────────────────────
    const refresh = useCallback(() => {
        setPosts(postService.getAll());
        setCategories(categoryService.getAll());
        setMedia(mediaService.getAll());
    }, []);

    const createPost = useCallback((data) => {
        const post = postService.create(data);
        setPosts(postService.getAll());
        return post;
    }, []);

    const updatePost = useCallback((id, data) => {
        const post = postService.update(id, data);
        setPosts(postService.getAll());
        return post;
    }, []);

    const publishPost = useCallback((id) => {
        const post = postService.publish(id);
        setPosts(postService.getAll());
        return post;
    }, []);

    const unpublishPost = useCallback((id) => {
        const post = postService.unpublish(id);
        setPosts(postService.getAll());
        return post;
    }, []);

    const deletePost = useCallback((id) => {
        postService.delete(id);
        setPosts(postService.getAll());
    }, []);

    const toggleFeatured = useCallback((id, featured) => {
        postService.setFeatured(id, featured);
        setPosts(postService.getAll());
    }, []);

    // ── Categories ────────────────────────────────────────────────────────────
    const createCategory = useCallback((data) => {
        const cat = categoryService.create(data);
        setCategories(categoryService.getAll());
        return cat;
    }, []);

    const updateCategory = useCallback((id, data) => {
        const cat = categoryService.update(id, data);
        setCategories(categoryService.getAll());
        return cat;
    }, []);

    const deleteCategory = useCallback((id) => {
        categoryService.delete(id);
        setCategories(categoryService.getAll());
    }, []);

    // ── Media ─────────────────────────────────────────────────────────────────
    const uploadMedia = useCallback(async (file) => {
        const item = await mediaService.fromFile(file);
        setMedia(mediaService.getAll());
        return item;
    }, []);

    const deleteMedia = useCallback((id) => {
        mediaService.delete(id);
        setMedia(mediaService.getAll());
    }, []);

    // ── Derived Data ──────────────────────────────────────────────────────────
    const publishedPosts = posts
        .filter(p => p.status === 'published')
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    const draftPosts = posts.filter(p => p.status === 'draft');
    const featuredPost = publishedPosts.find(p => p.isFeatured) || null;

    const value = {
        // State
        posts, publishedPosts, draftPosts, featuredPost,
        categories, media, isAdmin,
        // Auth
        login, logout,
        // Posts
        createPost, updatePost, publishPost, unpublishPost, deletePost, toggleFeatured, refresh,
        // Categories
        createCategory, updateCategory, deleteCategory,
        // Media
        uploadMedia, deleteMedia,
    };

    return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
    const ctx = useContext(CmsContext);
    if (!ctx) throw new Error('useCms must be used within CmsProvider');
    return ctx;
}
