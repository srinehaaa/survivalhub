import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/profileTypes';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'full_name' | 'course' | 'year' | 'monthly_budget' | 'min_attendance'>>) => Promise<{ error: string | null }>;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  course: string;
  year: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function ensureProfile(user: User): Promise<{ profile: Profile | null; error: string | null }> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) return { profile: null, error: error.message };
  if (data) return { profile: data as Profile, error: null };

  const meta = user.user_metadata ?? {};
  const payload = {
    id: user.id,
    full_name: String(meta.full_name ?? user.email?.split('@')[0] ?? 'Student'),
    email: user.email ?? String(meta.email ?? ''),
    course: String(meta.course ?? ''),
    year: String(meta.year ?? ''),
    monthly_budget: 15000,
    min_attendance: 75,
  };

  const { data: created, error: createError } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();

  if (createError) return { profile: null, error: createError.message };
  return { profile: created as Profile, error: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid: string) {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user || authUser.user.id !== uid) {
      setProfile(null);
      return;
    }
    const result = await ensureProfile(authUser.user);
    if (result.error) {
      console.error('Profile load error:', result.error);
      return;
    }
    setProfile(result.profile);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) await loadProfile(data.session.user.id);
      if (mounted) setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        void loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signUp({ fullName, email, password, course, year }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, course, year } },
    });

    if (error) return { error: error.message };
    if (!data.user) return { error: 'Account could not be created. Please try again.' };

    // When email confirmation is off, the session is available immediately.
    // If confirmation is enabled, ensureProfile will run after the first login.
    if (data.session) {
      const result = await ensureProfile(data.user);
      if (result.error) return { error: `Account created, but profile setup failed: ${result.error}` };
      setProfile(result.profile);
    }

    return { error: null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setUser(null);
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id);
  }

  async function updateProfile(
    updates: Partial<Pick<Profile, 'full_name' | 'course' | 'year' | 'monthly_budget' | 'min_attendance'>>
  ) {
    if (!user) return { error: 'You are not signed in.' };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('*')
      .single();
    if (error) return { error: error.message };
    setProfile(data as Profile);
    return { error: null };
  }

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signUp, signIn, signOut, resetPassword, refreshProfile, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

