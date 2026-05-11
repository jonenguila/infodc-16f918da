import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Lembrete {
  id: string;
  ordem: number;
  texto: string;
  link_url: string;
  link_label: string;
}

export const LembretesPedido = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.perfil === "Administrador";

  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lembrete[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchLembretes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lembretes_pedido")
      .select("*")
      .order("ordem", { ascending: true });
    setLembretes((data ?? []) as Lembrete[]);
    setLoading(false);
  };

  useEffect(() => { fetchLembretes(); }, []);

  const openEditor = () => {
    setEditing(lembretes.map((l) => ({ ...l })));
    setDialogOpen(true);
  };

  const updateField = (idx: number, field: keyof Lembrete, value: string) => {
    setEditing((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= editing.length) return;
    const next = [...editing];
    [next[idx], next[target]] = [next[target], next[idx]];
    setEditing(next);
  };

  const removeItem = (idx: number) => {
    setEditing((prev) => prev.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    setEditing((prev) => [
      ...prev,
      { id: `new-${Date.now()}-${Math.random()}`, ordem: prev.length + 1, texto: "", link_url: "", link_label: "" },
    ]);
  };

  const isValidUrl = (value: string) => {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validateAll = (): string | null => {
    for (let i = 0; i < editing.length; i++) {
      const l = editing[i];
      if (!l.texto.trim()) return `Lembrete #${i + 1}: o texto é obrigatório.`;
      const url = l.link_url.trim();
      const label = l.link_label.trim();
      if (url && !isValidUrl(url)) return `Lembrete #${i + 1}: a URL deve começar por http:// ou https:// e ser válida.`;
      if (label && !url) return `Lembrete #${i + 1}: o texto do link só pode existir quando há uma URL.`;
      if (url && !label) return `Lembrete #${i + 1}: indique também o texto do link.`;
    }
    return null;
  };

  const handleSave = async () => {
    const err = validateAll();
    if (err) {
      toast({ title: "Validação falhou", description: err, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const originalIds = new Set(lembretes.map((l) => l.id));
      const keptIds = new Set(editing.filter((l) => !l.id.startsWith("new-")).map((l) => l.id));
      const toDelete = [...originalIds].filter((id) => !keptIds.has(id));

      if (toDelete.length) {
        const { error } = await supabase.from("lembretes_pedido").delete().in("id", toDelete);
        if (error) throw error;
      }

      for (let i = 0; i < editing.length; i++) {
        const l = editing[i];
        const payload = { ordem: i + 1, texto: l.texto.trim(), link_url: l.link_url.trim(), link_label: l.link_label.trim() };
        if (l.id.startsWith("new-")) {
          const { error } = await supabase.from("lembretes_pedido").insert(payload);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("lembretes_pedido").update(payload).eq("id", l.id);
          if (error) throw error;
        }
      }

      toast({ title: "Lembretes atualizados" });
      setDialogOpen(false);
      await fetchLembretes();
    } catch (e: any) {
      toast({ title: "Erro ao guardar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 sticky top-8 space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">Lembretes Importantes:</h2>
        {isAdmin && (
          <Button variant="ghost" size="sm" onClick={openEditor} className="gap-1">
            <Pencil className="w-3.5 h-3.5" /> Editar
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">A carregar...</p>
      ) : lembretes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Não aplicável</p>
      ) : (
        <ul className="space-y-3 text-sm text-muted-foreground">
          {lembretes.map((l) => (
            <li key={l.id} className="flex gap-2 leading-relaxed">
              <span className="text-primary mt-0.5">•</span>
              <span>
                {l.texto}
                {l.link_url && (
                  <>
                    {" "}
                    <a
                      href={l.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline inline-flex items-center gap-1 hover:text-primary/80"
                    >
                      {l.link_label || l.link_url} <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {isAdmin && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Lembretes</DialogTitle>
              <DialogDescription>Apenas administradores podem alterar os lembretes do formulário de pedido.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {editing.map((l, idx) => (
                <div key={l.id} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Lembrete #{idx + 1}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => moveItem(idx, -1)} disabled={idx === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveItem(idx, 1)} disabled={idx === editing.length - 1}>
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Texto *</Label>
                    <Textarea
                      value={l.texto}
                      onChange={(e) => updateField(idx, "texto", e.target.value)}
                      rows={2}
                      className={!l.texto.trim() ? "border-destructive" : ""}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>URL do link (opcional)</Label>
                      <Input value={l.link_url} onChange={(e) => updateField(idx, "link_url", e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Texto do link</Label>
                      <Input value={l.link_label} onChange={(e) => updateField(idx, "link_label", e.target.value)} placeholder="Abrir formulário" />
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addItem} className="w-full gap-2">
                <Plus className="w-4 h-4" /> Adicionar lembrete
              </Button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving} className="gap-2">
                <X className="w-4 h-4" /> Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" /> {saving ? "A guardar..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
