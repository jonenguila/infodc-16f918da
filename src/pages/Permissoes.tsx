import { useState, useEffect } from "react";
import { Search, Shield, ShieldCheck, ShieldAlert, Edit, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Perfil } from "@/lib/permissions";

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

const allPermissoes = [
  "Ver Produtos", "Editar Produtos", "Criar Pedidos", "Aprovar Pedidos",
  "Gerir Stock", "Ver Relatórios", "Exportar Dados", "Importar Dados",
  "Gerir Utilizadores", "Gerir Armazéns",
];

const PERMISSIONS_KEY = "erp_user_permissions";

function getUserPermissions(): Record<string, string[]> {
  try { return JSON.parse(localStorage.getItem(PERMISSIONS_KEY) || "{}"); } catch { return {}; }
}

function saveUserPermissions(data: Record<string, string[]>) {
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(data));
}

const Permissoes = () => {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [formPerfil, setFormPerfil] = useState<Perfil>("Utilizador");
  const [formPermissoes, setFormPermissoes] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>({});

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
    setUserPermissions(getUserPermissions());
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) =>
    u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getPermissionsForUser = (userId: string, perfil: Perfil): string[] => {
    if (userPermissions[userId]) return userPermissions[userId];
    if (perfil === "Administrador") return [...allPermissoes];
    if (perfil === "Gestor") return ["Ver Produtos", "Editar Produtos", "Criar Pedidos", "Aprovar Pedidos", "Ver Relatórios"];
    return ["Ver Produtos", "Criar Pedidos"];
  };

  const openEdit = (user: UserWithRole) => {
    setEditUser(user);
    setFormPerfil(user.perfil);
    setFormPermissoes(getPermissionsForUser(user.user_id, user.perfil));
    setDialogOpen(true);
  };

  const togglePermissao = (perm: string) => {
    setFormPermissoes((prev) => prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]);
  };

  const handleSave = async () => {
    if (!editUser) return;
    // Update role in database
    await supabase
      .from("user_roles")
      .update({ role: perfilToRoleMap[formPerfil] as any })
      .eq("user_id", editUser.user_id);
    // Save granular permissions locally (could be migrated to DB later)
    const perms = getUserPermissions();
    perms[editUser.user_id] = formPermissoes;
    saveUserPermissions(perms);
    await fetchUsers();
    setDialogOpen(false);
    toast.success("Permissões guardadas com sucesso");
  };

  const getPerfilIcon = (perfil: string) => {
    if (perfil === "Administrador") return <ShieldAlert className="w-4 h-4 text-destructive" />;
    if (perfil === "Gestor") return <ShieldCheck className="w-4 h-4 text-primary" />;
    return <Shield className="w-4 h-4 text-muted-foreground" />;
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Permissões</h1>
        <p className="text-sm text-muted-foreground mt-1">Configurar permissões de acesso dos utilizadores</p>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Pesquisar utilizador..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum utilizador registado.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead>Utilizador</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-foreground">{user.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPerfilIcon(user.perfil)}
                      <span className="text-sm text-foreground">{user.perfil}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {getPermissionsForUser(user.user_id, user.perfil).length} permissões
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(user)} title="Editar permissões">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Permissões</DialogTitle>
            <DialogDescription>{editUser?.nome} — {editUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Perfil</Label>
              <Select value={formPerfil} onValueChange={(v) => setFormPerfil(v as Perfil)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Gestor">Gestor</SelectItem>
                  <SelectItem value="Utilizador">Utilizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Permissões</Label>
              <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto p-3 bg-secondary/30 rounded-lg">
                {allPermissoes.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <Checkbox checked={formPermissoes.includes(perm)} onCheckedChange={() => togglePermissao(perm)} />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Permissoes;
