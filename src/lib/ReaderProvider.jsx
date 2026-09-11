/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { getNotificationSubscription, getReaderProfile, readerAuthEnabled, signInReader, signUpReader, updateReaderProfile } from './reader';

const ReaderContext = createContext(null);

export function ReaderProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(readerAuthEnabled);

    useEffect(() => {
        if (!readerAuthEnabled) return undefined;
        let mounted = true;
        supabase.auth.getSession().then(async ({ data }) => {
            if (!mounted) return;
            setUser(data.session?.user || null);
            if (data.session?.user) {
                const [nextProfile, nextSubscription] = await Promise.all([
                    getReaderProfile(data.session.user.id),
                    getNotificationSubscription(data.session.user.email),
                ]);
                if (mounted) { setProfile(nextProfile); setSubscription(nextSubscription); }
            }
            setLoading(false);
        });
        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user || null);
            if (session?.user) {
                setProfile(await getReaderProfile(session.user.id));
                setSubscription(await getNotificationSubscription(session.user.email));
            } else { setProfile(null); setSubscription(null); }
        });
        return () => { mounted = false; listener.subscription.unsubscribe(); };
    }, []);

    const value = {
        user, profile, subscription, loading, enabled: readerAuthEnabled,
        signUp: signUpReader,
        signIn: signInReader,
        signOut: () => supabase.auth.signOut(),
        resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account` }),
        updateProfile: async (displayName) => { const next = await updateReaderProfile(user.id, displayName); setProfile(next); return next; },
        refreshProfile: async () => { if (user) setProfile(await getReaderProfile(user.id)); },
        refreshSubscription: async () => { if (user?.email) setSubscription(await getNotificationSubscription(user.email)); },
    };
    return <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>;
}

export function useReader() {
    const context = useContext(ReaderContext);
    if (!context) throw new Error('useReader must be used within ReaderProvider');
    return context;
}
