import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getIcon, COR_PRESETS } from "./iconMap";
import type { ComunicacaoCard } from "@/hooks/useComunicacaoCards";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<ComunicacaoCard> | null;
  onSave: (data: Omit<ComunicacaoCard, "id" | "created_at" | "updated_at" | "ordem">) => Promise<void>;
  seccao: ComunicacaoCard["seccao"];
}

export const CardEditorDialog = ({ open, onOpenChange, initial, onSave, seccao }: Props) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [icone, setIcone] = useState("FileText");
  const [textoBotao, setTextoBotao] = useState("Aceder");
  const [link, setLink] = useState("");
  const [abrirNovaAba, setAbrirNovaAba] = useState(true);
  const [cor, setCor] = useState("bg-primary/10 text-primary");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitulo(initial?.titulo ?? "");
      setDescricao(initial?.descricao ?? "");
      setIcone(initial?.icone ?? "FileText");
      setTextoBotao(initial?.texto_botao ?? "Aceder");
      setLink(initial?.link ?? "");
      setAbrirNovaAba(initial?.abrir_nova_aba ?? true);
      setCor(initial?.cor ?? "bg-primary/10 text-primary");
    }
  }, [open, initial]);

  const Icon = getIcon(icone);

  const handleSave = async () => {
    if (!titulo.trim()) return;
    setSaving(true);
    try {
      await onSave({
        seccao,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        icone: icone.trim() || "FileText",
        texto_botao: textoBotao.trim() || "Aceder",
        link: link.trim(),
        abrir_nova_aba: abrirNovaAba,
        cor,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Editar card" : "Novo card"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${cor}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="text-sm text-muted-foreground">Pré-visualização do ícone</div>
          </div>

          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ícone (Lucide)</Label>
              <Input value={icone} onChange={(e) => setIcone(e.target.value)} placeholder="FileText" />
              <p className="text-xs text-muted-foreground">
                Ex: FileText, Megaphone, Palette, Image, Video, Download
              </p>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <Select value={cor} onValueChange={setCor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COR_PRESETS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Texto do botão</Label>
            <Input value={textoBotao} onChange={(e) => setTextoBotao(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Link (URL)</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="cursor-pointer">Abrir em nova aba</Label>
              <p className="text-xs text-muted-foreground">Caso contrário abre na mesma janela</p>
            </div>
            <Switch checked={abrirNovaAba} onCheckedChange={setAbrirNovaAba} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !titulo.trim()}>
            {saving ? "A guardar..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
