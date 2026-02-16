import { useState } from "react";
import { Search, Shield, ShieldCheck, ShieldAlert, Edit } from "lucide-react";
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

interface User {
  id: number;
  nome: string;
  email: string;
  perfil: "Administrador" | "Gestor" | "Utilizador";
  estado: "Ativo" | "Inativo";
  permissoes: string[];
}

const allPermissoes = [
  "Ver Produtos", "Editar Produtos", "Criar Pedidos", "Aprovar Pedidos",
  "Gerir Stock", "Ver Relatórios", "Exportar Dados", "Importar Dados",
  "Gerir Utilizadores", "Gerir Armazéns",
];

const mockUsers: User[] = [
  { id: 1, nome: "Admin Sistema", email: "admin@empresa.pt", perfil: "Administrador", estado: "Ativo", permissoes: allPermissoes },
  { id: 2, nome: "Ana Costa", email: "ana.costa@empresa.pt", perfil: "Gestor", estado: "Ativo", permissoes: ["Ver Produtos", "Editar Produtos", "Criar Pedidos", "Aprovar Pedidos", "Ver Relatórios"] },
  { id: 3, nome: "João Silva", email: "joao.silva@empresa.pt", perfil: "Utilizador", estado: "Ativo", permissoes: ["Ver Produtos", "Criar Pedidos"] },
  { id: 4, nome: "Maria Santos", email: "maria.santos@empresa.pt", perfil: "Utilizador", estado: "Inativo", permissoes: ["Ver Produtos"] },
];

const Permissoes = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(mockUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [formPerfil, setFormPerfil] = useState("");
  const [formPermissoes, setFormPermissoes] = useState<string[]>([]);

  const filtered = users.filter((u) =>
    u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (user: User) => {
    setEditUser(user);
    setFormPerfil(user.perfil);
    setFormPermissoes([...user.permissoes]);
    setDialogOpen(true);
  };

  const togglePermissao = (perm: string) => {
    setFormPermissoes((prev) => prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]);
  };

  const handleSave = () => {
    if (!editUser) return;
    setUsers((prev) =>
      prev.map((u) => u.id === editUser.id ? { ...u, perfil: formPerfil as User["perfil"], permissoes: formPermissoes } : u)
    );
    setDialogOpen(false);
  };

  const getPerfilIcon = (perfil: string) => {
    if (perfil === "Administrador") return <ShieldAlert className="w-4 h-4 text-destructive" />;
    if (perfil === "Gestor") return <ShieldCheck className="w-4 h-4 text-primary" />;
    return <Shield className="w-4 h-4 text-muted-foreground" />;
  };

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

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Utilizador</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead>Estado</TableHead>
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
                  <span className="text-xs text-muted-foreground">{user.permissoes.length} permissões</span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.estado === "Ativo" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                    {user.estado}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Permissões</DialogTitle>
            <DialogDescription>{editUser?.nome} — {editUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Perfil</Label>
              <Select value={formPerfil} onValueChange={setFormPerfil}>
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
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Permissoes;
