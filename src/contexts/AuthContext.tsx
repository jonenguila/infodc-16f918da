import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  cargo?: string;
  perfil: "Administrador" | "Gestor" | "Utilizador";
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (data: { nome: string; email: string; password: string; cargo?: string }) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "erp_users";
const SESSION_KEY = "erp_session";

interface StoredUser extends UserProfile {
  password: string;
}

const DEFAULT_ADMIN: StoredUser = {
  id: "admin-default",
  nome: "Administrador",
  email: "admin",
  cargo: "Administrador do Sistema",
  perfil: "Administrador",
  password: "admin",
};

function getStoredUsers(): StoredUser[] {
  try {
    const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    if (!users.some((u) => u.id === DEFAULT_ADMIN.id)) {
      users.unshift(DEFAULT_ADMIN);
      saveStoredUsers(users);
    }
    return users;
  } catch {
    saveStoredUsers([DEFAULT_ADMIN]);
    return [DEFAULT_ADMIN];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const login = (email: string, password: string) => {
    const users = getStoredUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { success: false, error: "Email ou palavra-passe incorretos." };
    const { password: _, ...profile } = found;
    setUser(profile);
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    return { success: true };
  };

  const register = (data: { nome: string; email: string; password: string; cargo?: string }) => {
    const users = getStoredUsers();
    if (users.some((u) => u.email === data.email)) {
      return { success: false, error: "Este email já está registado." };
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      nome: data.nome,
      email: data.email,
      cargo: data.cargo || "",
      perfil: "Utilizador",
      password: data.password,
    };
    saveStoredUsers([...users, newUser]);
    const { password: _, ...profile } = newUser;
    setUser(profile);
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    const users = getStoredUsers();
    saveStoredUsers(users.map((u) => (u.id === user.id ? { ...u, ...data } : u)));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
