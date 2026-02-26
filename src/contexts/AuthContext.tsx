import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  avatar?: string;
  cargo?: string;
  perfil: "Administrador" | "Gestor" | "Utilizador";
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { nome: string; email: string; password: string; cargo?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const roleToPerfilMap: Record<string, UserProfile["perfil"]> = {
  admin: "Administrador",
  gestor: "Gestor",
  utilizador: "Utilizador",
};

async function fetchUserProfile(authUser: User): Promise<UserProfile | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", authUser.id)
    .single();

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authUser.id)
    .single();

  if (!profile) return null;

  const role = roleData?.role || "utilizador";

  return {
    id: profile.id,
    user_id: profile.user_id,
    nome: profile.nome,
    email: profile.email,
    avatar: profile.avatar || undefined,
    cargo: profile.cargo || undefined,
    perfil: roleToPerfilMap[role] || "Utilizador",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    const profile = await fetchUserProfile(authUser);
    setUser(profile);
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const register = async (data: { nome: string; email: string; password: string; cargo?: string }) => {
    const { error, data: authData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { nome: data.nome } },
    });
    if (error) return { success: false, error: error.message };

    // Update profile with cargo if provided
    if (authData.user && data.cargo) {
      await supabase
        .from("profiles")
        .update({ cargo: data.cargo })
        .eq("user_id", authData.user.id);
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const { perfil, id, user_id, ...profileData } = data;
    await supabase.from("profiles").update(profileData).eq("user_id", user.user_id);
    await loadProfile((await supabase.auth.getUser()).data.user);
  };

  const refreshProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    await loadProfile(authUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
