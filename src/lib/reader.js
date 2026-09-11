import { supabase } from './supabase';

export const readerAuthEnabled = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
const LOCAL_COMMENTS_KEY = 'storygrid_reader_comments';
const LOCAL_SUBSCRIBERS_KEY = 'storygrid_newsletter_subscribers';

function localComments() {
    try { return JSON.parse(localStorage.getItem(LOCAL_COMMENTS_KEY) || '[]'); } catch { return []; }
}

function saveLocalComments(comments) {
    localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(comments));
}

function localSubscribers() {
    try { return JSON.parse(localStorage.getItem(LOCAL_SUBSCRIBERS_KEY) || '[]'); } catch { return []; }
}

export function getLocalComments() { return localComments(); }

export function updateLocalCommentStatus(id, status) {
    const comments = localComments().map(comment => comment.id === id ? { ...comment, status, updated_at: new Date().toISOString() } : comment);
    saveLocalComments(comments);
}

export function deleteLocalComment(id) {
    saveLocalComments(localComments().filter(comment => comment.id !== id));
}

export async function signUpReader({ email, password, displayName }) {
    if (!readerAuthEnabled) throw new Error('Reader accounts require Supabase configuration.');
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: displayName.trim() } } });
    if (error) throw error;
    return data;
}

export async function signInReader(email, password) {
    if (!readerAuthEnabled) throw new Error('Reader accounts require Supabase configuration.');
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    return data;
}

export async function updateReaderProfile(userId, displayName) {
    const { data, error } = await supabase.from('profiles').update({
        display_name: displayName.trim(),
        updated_at: new Date().toISOString(),
    }).eq('id', userId).select().single();
    if (error) throw error;
    return data;
}

export async function getReaderProfile(userId) {
    const { data, error } = await supabase.from('profiles').select('id,email,display_name,avatar_url,created_at,updated_at,role').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data;
}

export async function saveNotificationSubscription({ email, userId, enabled }) {
    if (!readerAuthEnabled) {
        const normalizedEmail = email.trim().toLowerCase();
        const subscribers = localSubscribers();
        const existing = subscribers.find(subscriber => subscriber.email === normalizedEmail);
        const next = { email: normalizedEmail, userId: userId || null, subscribedToNewPosts: enabled, subscribedAt: enabled ? new Date().toISOString() : null };
        localStorage.setItem(LOCAL_SUBSCRIBERS_KEY, JSON.stringify(existing ? subscribers.map(subscriber => subscriber.email === normalizedEmail ? { ...subscriber, ...next } : subscriber) : [...subscribers, next]));
        return next;
    }
    const values = {
        email: email.trim().toLowerCase(),
        user_id: userId || null,
        subscribed_to_new_posts: enabled,
        subscribed_at: enabled ? new Date().toISOString() : null,
        unsubscribed_at: enabled ? null : new Date().toISOString(),
    };
    const { data, error } = await supabase.from('email_subscribers').upsert(values, { onConflict: 'email' }).select().single();
    if (error) throw error;
    return data;
}

export async function getNotificationSubscription(email) {
    if (!readerAuthEnabled) return localSubscribers().find(subscriber => subscriber.email === email.toLowerCase()) || null;
    const { data, error } = await supabase.from('email_subscribers').select('id,email,subscribed_to_new_posts,subscribed_at,unsubscribed_at').eq('email', email.toLowerCase()).maybeSingle();
    if (error) throw error;
    return data;
}

export async function getApprovedComments(postId) {
    if (!readerAuthEnabled) return localComments().filter(comment => comment.postId === postId && comment.status === 'approved');
    const { data, error } = await supabase.from('comments').select('id,post_id,parent_id,author_display_name,content,created_at').eq('post_id', postId).eq('status', 'approved').order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
}

export async function createComment({ postId, userId, displayName, content, notify }) {
    const clean = content.trim();
    if (clean.length < 1 || clean.length > 2000) throw new Error('Comments must be between 1 and 2,000 characters.');
    if (!readerAuthEnabled) {
        if (!displayName?.trim()) throw new Error('Display name is required.');
        const comment = { id: crypto.randomUUID(), postId, author_display_name: displayName.trim().slice(0, 80), content: clean, status: 'pending', created_at: new Date().toISOString() };
        saveLocalComments([...localComments(), comment]);
        return comment;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !sessionData?.user || sessionData.user.id !== userId) {
        throw new Error('You must be signed in to post a comment.');
    }

    const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', userId)
        .maybeSingle();

    const authorDisplayName = (profileData?.display_name || profileData?.email || displayName || 'Reader').trim().slice(0, 80);

    const { data, error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: userId,
        author_display_name: authorDisplayName,
        content: clean,
        status: 'pending',
    }).select().single();
    if (error) throw error;
    if (notify) {
        await supabase.from('comment_notification_preferences').upsert({ post_id: postId, user_id: userId, enabled: true }, { onConflict: 'post_id,user_id' });
    }
    return data;
}

export async function getCommentPreference(postId, userId) {
    const { data, error } = await supabase.from('comment_notification_preferences').select('enabled').eq('post_id', postId).eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return data?.enabled || false;
}
