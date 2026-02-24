import { useState } from "react";
import { Plus, Trash2, Building2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Delegacao {
  id: number;
  nome: string;
  localizacao: string;
  responsavel: string;
}

const mockDelegacoes: Delegacao[] = [
  { id: 1, nome: "Lisboa", localizacao: "Lisboa", responsavel: "Ana Costa" },
  { id: 2, nome: "Porto", localizacao: "Porto", responsavel: "João Silva" },
  { id: 3, nome: "Coimbra", localizacao: "Coimbra", responsavel: "Maria Santos" },
  { id: 4, nome: "Faro", localizacao: "Faro", responsavel: "Pedro Alves" },
  { id: 5, nome: "Braga", localizacao: "Braga", responsavel: "Sofia Mendes" },
  { id: 6, nome: "Aveiro", localizacao: "Aveiro", responsavel: "Rui Ferreira" },
];

const StockDelegacoes = () => {
  const [delegacoes, setDelegacoes] = useState<Delegacao[]>(mockDelegacoes);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nome: "", localizacao: "", responsavel: "" });

  const openNew = () => {
    setEditingId(null);
    setFormData({ nome: "", localizacao: "", responsavel: "" });
    setDialogOpen(true);
  };

  const openEdit = (del: Delegacao) => {
    setEditingId(del.id);
    setFormData({ nome: del.nome, localizacao: del.localizacao, responsavel: del.responsavel });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nome.trim()) return;
    if (editingId !== null) {
      setDelegacoes((prev) => prev.map((d) => d.id === editingId ? { ...d, nome: formData.nome.trim(), localizacao: formData.localizacao.trim(), responsavel: formData.responsavel.trim() } : d));
    } else {
      setDelegacoes((prev) => [...prev, { id: Date.now(), nome: formData.nome.trim(), localizacao: formData.localizacao.trim(), responsavel: formData.responsavel.trim() }]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setDelegacoes((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="p-8 animate-fade-in bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Delegações</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerir delegações disponíveis</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Nova Delegação</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Delegação</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="text-right w-28">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {delegacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Nenhuma delegação registada.
                </TableCell>
              </TableRow>
            ) : delegacoes.map((del) => (
              <TableRow key={del.id} className="hover:bg-muted/30">
                <TableCell className="text-muted-foreground text-xs">{del.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-medium text-sm text-foreground">{del.nome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{del.localizacao || "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{del.responsavel || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(del)}>
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(del.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground mt-3">{delegacoes.length} delegação(ões)</p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Editar Delegação" : "Nova Delegação"}</DialogTitle>
            <DialogDescription>{editingId !== null ? "Altere os dados da delegação." : "Adicione uma nova delegação."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: Setúbal" />
            </div>
            <div className="grid gap-2">
              <Label>Localização</Label>
              <Input value={formData.localizacao} onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })} placeholder="Ex: Setúbal" />
            </div>
            <div className="grid gap-2">
              <Label>Responsável</Label>
              <Input value={formData.responsavel} onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })} placeholder="Nome do responsável" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formData.nome.trim()}>{editingId !== null ? "Guardar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockDelegacoes;
