import { useState } from "react";
import { Plus, Trash2, MapPin, Pencil } from "lucide-react";
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

const StockLocalizacoes = () => {
  const { localizacoes, adicionarLocalizacao, editarLocalizacao, eliminarLocalizacao } = useStockStore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nome: "", descricao: "" });

  const openNew = () => {
    setEditingId(null);
    setFormData({ nome: "", descricao: "" });
    setDialogOpen(true);
  };

  const openEdit = (l: { id: string; nome: string; descricao: string }) => {
    setEditingId(l.id);
    setFormData({ nome: l.nome, descricao: l.descricao });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) return;
    if (editingId !== null) {
      await editarLocalizacao(editingId, formData.nome, formData.descricao);
      toast({ title: "Localização atualizada" });
    } else {
      const err = await adicionarLocalizacao(formData.nome, formData.descricao);
      if (err) { toast({ title: "Erro", description: err, variant: "destructive" }); return; }
      toast({ title: "Localização criada" });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await eliminarLocalizacao(id);
    toast({ title: "Localização eliminada" });
  };

  return (
    <div className="p-8 animate-fade-in bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Localizações</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerir localizações dos produtos</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Nova Localização</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right w-28">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localizacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Nenhuma localização registada.
                </TableCell>
              </TableRow>
            ) : localizacoes.map((l, idx) => (
              <TableRow key={l.id} className="hover:bg-muted/30">
                <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-medium text-sm text-foreground">{l.nome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{l.descricao || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(l)}>
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground mt-3">{localizacoes.length} localização(ões)</p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Editar Localização" : "Nova Localização"}</DialogTitle>
            <DialogDescription>{editingId !== null ? "Altere os dados da localização." : "Adicione uma nova localização."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: Delegação Norte" />
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

export default StockLocalizacoes;
