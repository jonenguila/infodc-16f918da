import { useState } from "react";
import { Search, Plus, Edit, Trash2, Warehouse, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ArmazemItem {
  id: number;
  nome: string;
  localizacao: string;
  capacidade: string;
  ocupacao: number;
  responsavel: string;
  estado: "Ativo" | "Inativo";
}

const mockData: ArmazemItem[] = [
  { id: 1, nome: "Armazém Central Lisboa", localizacao: "Lisboa", capacidade: "5000 unidades", ocupacao: 72, responsavel: "Ana Costa", estado: "Ativo" },
  { id: 2, nome: "Armazém Norte", localizacao: "Porto", capacidade: "3000 unidades", ocupacao: 45, responsavel: "João Silva", estado: "Ativo" },
  { id: 3, nome: "Armazém Sul", localizacao: "Faro", capacidade: "2000 unidades", ocupacao: 88, responsavel: "Maria Santos", estado: "Ativo" },
  { id: 4, nome: "Armazém Centro", localizacao: "Coimbra", capacidade: "1500 unidades", ocupacao: 30, responsavel: "Pedro Alves", estado: "Inativo" },
];

const Armazem = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(mockData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ArmazemItem | null>(null);
  const [formData, setFormData] = useState({ nome: "", localizacao: "", capacidade: "", responsavel: "" });

  const filtered = items.filter((i) =>
    i.nome.toLowerCase().includes(search.toLowerCase()) ||
    i.localizacao.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditItem(null);
    setFormData({ nome: "", localizacao: "", capacidade: "", responsavel: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: ArmazemItem) => {
    setEditItem(item);
    setFormData({ nome: item.nome, localizacao: item.localizacao, capacidade: item.capacidade, responsavel: item.responsavel });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editItem) {
      setItems((prev) => prev.map((i) => i.id === editItem.id ? { ...i, ...formData } : i));
    } else {
      setItems((prev) => [...prev, { id: Date.now(), ...formData, ocupacao: 0, estado: "Ativo" as const }]);
    }
    setDialogOpen(false);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Armazéns</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerir armazéns e localizações</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Novo Armazém</Button>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Pesquisar armazém..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Nome</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead>Ocupação</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-foreground">{item.nome}</TableCell>
                <TableCell className="text-muted-foreground">{item.localizacao}</TableCell>
                <TableCell className="text-muted-foreground">{item.capacidade}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${item.ocupacao > 80 ? "bg-destructive" : item.ocupacao > 50 ? "bg-warning" : "bg-success"}`}
                        style={{ width: `${item.ocupacao}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.ocupacao}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.responsavel}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.estado === "Ativo" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                    {item.estado}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Editar Armazém" : "Novo Armazém"}</DialogTitle>
            <DialogDescription>Preencha as informações do armazém.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nome</Label><Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Localização</Label><Input value={formData.localizacao} onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Capacidade</Label><Input value={formData.capacidade} onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Responsável</Label><Input value={formData.responsavel} onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editItem ? "Guardar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Armazem;
