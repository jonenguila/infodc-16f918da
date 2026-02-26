import { useState, useEffect } from "react";
import { Plus, Trash2, Shield, KeyRound, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Perfil } from "@/lib/permissions";
import { isPasswordValid } from "@/lib/passwordValidation";
import { PasswordStrength } from "@/components/PasswordStrength";

interface UserWithRole {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  cargo?: string;
  perfil: Perfil;
}

const roleToPerfilMap: Record<string, Perfil> = {
  admin: "Administrador",
  gestor: "Gestor",
  utilizador: "Utilizador",
};

const perfilToRoleMap: Record<Perfil, string> = {
  Administrador: "admin",
  Gestor: "gestor",
  Utilizador: "utilizador",
};

const GestaoUtilizadores = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", cargo: "", perfil: "Utilizador" as Perfil, password: "" });

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");

    if (profiles) {
      const usersWithRoles: UserWithRole[] = profiles.map((p: any) => {
        const userRole = roles?.find((r: any) => r.user_id === p.user_id);
        return {
          id: p.id,
          user_id: p.user_id,
          nome: p.nome,
          email: p.email,
          cargo: p.cargo || undefined,
          perfil: roleToPerfilMap[userRole?.role || "utilizador"] || "Utilizador",
        };
      });
      setUsers(usersWithRoles);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!form.nome || !form.email || !form.password) return;
    if (!isPasswordValid(form.password)) {
      toast.error("A palavra-passe não cumpre os requisitos de segurança");
      return;
    }
    setCreating(true);
    try {
      // Sign up new user via edge function or direct auth
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { nome: form.nome } },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.user) {
        // Update cargo if provided
        if (form.cargo) {
          await supabase.from("profiles").update({ cargo: form.cargo }).eq("user_id", data.user.id);
        }
        // Update role if not default
        if (form.perfil !== "Utilizador") {
          await supabase.from("user_roles").update({ role: perfilToRoleMap[form.perfil] as any }).eq("user_id", data.user.id);
        }
      }
      await fetchUsers();
      setShowNew(false);
      setForm({ nome: "", email: "", cargo: "", perfil: "Utilizador", password: "" });
      toast.success("Utilizador criado com sucesso");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdatePerfil = async (userId: string, perfil: Perfil) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: perfilToRoleMap[perfil] as any })
      .eq("user_id", userId);
    if (error) {
      toast.error("Erro ao atualizar perfil");
      return;
    }
    await fetchUsers();
    toast.success("Perfil atualizado com sucesso");
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.user_id) return;
    // Delete profile (cascade will handle user_roles)
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    if (error) {
      toast.error("Erro ao eliminar utilizador");
      return;
    }
    await fetchUsers();
    toast.success("Utilizador eliminado");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Utilizadores</h1>
          <p className="text-sm text-muted-foreground mt-1">Criar, editar e gerir permissões de utilizadores</p>
        </div>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Utilizador</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Utilizador</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Nome *</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="exemplo@email.com" /></div>
              <div className="space-y-2">
                <Label>Palavra-passe *</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <PasswordStrength password={form.password} />
              </div>
              <div className="space-y-2"><Label>Cargo</Label><Input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={form.perfil} onValueChange={(v) => setForm({ ...form, perfil: v as Perfil })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Gestor">Gestor</SelectItem>
                    <SelectItem value="Utilizador">Utilizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={!form.nome || !form.email || !isPasswordValid(form.password) || creating} className="w-full">
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Criar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {u.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{u.nome}</p>
                  <p className="text-xs text-muted-foreground">{u.email} {u.cargo ? `· ${u.cargo}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select value={u.perfil} onValueChange={(v) => handleUpdatePerfil(u.user_id, v as Perfil)}>
                  <SelectTrigger className="w-36 h-8">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Gestor">Gestor</SelectItem>
                    <SelectItem value="Utilizador">Utilizador</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(u.user_id)}
                  disabled={u.user_id === currentUser?.user_id}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GestaoUtilizadores;
