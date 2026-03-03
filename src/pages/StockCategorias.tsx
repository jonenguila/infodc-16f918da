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
import { useToast } from "@/hooks/use-toast";
import { useStockStore } from "@/stores/stockStore";

const StockCategorias = () => {
  const { tipologias, adicionarTipologia, editarTipologia, eliminarTipologia } = useStockStore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nome: "", descricao: "" });

  const openNew = () => {
    setEditingId(null);
    setFormData({ nome: "", descricao: "" });
    setDialogOpen(true);
  };

  const openEdit = (t: { id: string; nome: string; descricao: string }) => {
    setEditingId(t.id);
    setFormData({ nome: t.nome, descricao: t.descricao });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) return;
    if (editingId !== null) {
      await editarTipologia(editingId, formData.nome, formData.descricao);
      toast({ title: "Tipologia atualizada" });
    } else {
      const err = await adicionarTipologia(formData.nome, formData.descricao);
      if (err) { toast({ title: "Erro", description: err, variant: "destructive" }); return; }
      toast({ title: "Tipologia criada" });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await eliminarTipologia(id);
    toast({ title: "Tipologia eliminada" });
  };

  return (
    <div className="p-8 animate-fade-in bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tipologias</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerir tipologias de produtos</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Nova Tipologia</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Tipologia</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right w-28">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tipologias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Nenhuma tipologia registada.
                </TableCell>
              </TableRow>
            ) : tipologias.map((t, idx) => (
              <TableRow key={t.id} className="hover:bg-muted/30">
                <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-medium text-sm text-foreground">{t.nome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{t.descricao || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground mt-3">{tipologias.length} tipologia(s)</p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Editar Tipologia" : "Nova Tipologia"}</DialogTitle>
            <DialogDescription>{editingId !== null ? "Altere os dados da tipologia." : "Adicione uma nova tipologia de produtos."}</DialogDescription>
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
