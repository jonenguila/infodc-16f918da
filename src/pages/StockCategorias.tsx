import { useState } from "react";
import { Plus, Trash2, Tag, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Categoria {
  id: number;
  nome: string;
  descricao: string;
}

const mockCategorias: Categoria[] = [
  { id: 1, nome: "Escritório", descricao: "Material de escritório e papelaria" },
  { id: 2, nome: "Vestuário", descricao: "Roupa e acessórios corporativos" },
  { id: 3, nome: "Lifestyle", descricao: "Artigos de lifestyle e bem-estar" },
  { id: 4, nome: "Tecnologia", descricao: "Gadgets e acessórios tecnológicos" },
];

const StockCategorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>(mockCategorias);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nome: "", descricao: "" });

  const openNew = () => {
    setEditingId(null);
    setFormData({ nome: "", descricao: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: Categoria) => {
    setEditingId(cat.id);
    setFormData({ nome: cat.nome, descricao: cat.descricao });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nome.trim()) return;
    if (editingId !== null) {
      setCategorias((prev) => prev.map((c) => c.id === editingId ? { ...c, nome: formData.nome.trim(), descricao: formData.descricao.trim() } : c));
    } else {
      setCategorias((prev) => [...prev, { id: Date.now(), nome: formData.nome.trim(), descricao: formData.descricao.trim() }]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="p-8 animate-fade-in bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerir categorias de produtos</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Nova Categoria</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right w-28">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Nenhuma categoria registada.
                </TableCell>
              </TableRow>
            ) : categorias.map((cat) => (
              <TableRow key={cat.id} className="hover:bg-muted/30">
                <TableCell className="text-muted-foreground text-xs">{cat.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-medium text-sm text-foreground">{cat.nome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{cat.descricao || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground mt-3">{categorias.length} categoria(s)</p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>{editingId !== null ? "Altere os dados da categoria." : "Adicione uma nova categoria de produtos."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: Eletrónica" />
            </div>
            <div className="grid gap-2">
              <Label>Descrição (opcional)</Label>
              <Input value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} placeholder="Breve descrição" />
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

export default StockCategorias;
