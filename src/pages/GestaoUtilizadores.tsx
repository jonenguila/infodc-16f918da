import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Shield, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import type { Perfil } from "@/lib/permissions";

interface StoredUser {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  perfil: Perfil;
  password: string;
}

const USERS_KEY = "erp_users";

function getUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const perfilColors: Record<string, string> = {
  Administrador: "bg-red-100 text-red-700",
  Gestor: "bg-blue-100 text-blue-700",
  Utilizador: "bg-green-100 text-green-700",
};

const GestaoUtilizadores = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", cargo: "", perfil: "Utilizador" as Perfil, password: "" });

  useEffect(() => { setUsers(getUsers()); }, []);

  const refresh = () => setUsers(getUsers());

  const handleCreate = () => {
    if (!form.nome || !form.email || !form.password) return;
    const all = getUsers();
    if (all.some((u) => u.email === form.email)) {
      toast.error("Este utilizador já existe");
      return;
    }
    const newUser: StoredUser = { id: crypto.randomUUID(), ...form };
    saveUsers([...all, newUser]);
    refresh();
    setShowNew(false);
    setForm({ nome: "", email: "", cargo: "", perfil: "Utilizador", password: "" });
    toast.success("Utilizador criado com sucesso");
  };

  const handleUpdatePerfil = (id: string, perfil: Perfil) => {
    const all = getUsers();
    saveUsers(all.map((u) => (u.id === id ? { ...u, perfil } : u)));
    refresh();
    toast.success("Perfil atualizado com sucesso");
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) return;
    saveUsers(getUsers().filter((u) => u.id !== id));
    refresh();
    toast.success("Utilizador eliminado");
  };

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
              <div className="space-y-2"><Label>Utilizador / Email *</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Palavra-passe *</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
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
              <Button onClick={handleCreate} disabled={!form.nome || !form.email || !form.password} className="w-full">Criar</Button>
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
                <Select value={u.perfil} onValueChange={(v) => handleUpdatePerfil(u.id, v as Perfil)}>
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
                  onClick={() => handleDelete(u.id)}
                  disabled={u.id === currentUser?.id}
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
