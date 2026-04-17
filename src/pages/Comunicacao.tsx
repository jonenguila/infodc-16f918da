import { useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2, Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useComunicacaoCards, type ComunicacaoCard } from "@/hooks/useComunicacaoCards";
import { CardEditorDialog } from "@/components/comunicacao/CardEditorDialog";
import { getIcon } from "@/components/comunicacao/iconMap";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Comunicacao = () => {
  const { user } = useAuth();
  const canEdit = user?.perfil === "Administrador" || user?.perfil === "Gestor";
  const { cards, createCard, updateCard, deleteCard } = useComunicacaoCards("novos_pedidos");

  const [editMode, setEditMode] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ComunicacaoCard | null>(null);
  const [toDelete, setToDelete] = useState<ComunicacaoCard | null>(null);

  const openNew = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = (c: ComunicacaoCard) => { setEditing(c); setEditorOpen(true); };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novos Pedidos</h1>
          <p className="text-sm text-muted-foreground mt-1">Acesso rápido a formulários de comunicação</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant={editMode ? "default" : "outline"} size="sm" onClick={() => setEditMode(!editMode)}>
              <Settings2 className="w-4 h-4" /> {editMode ? "Concluir" : "Editar"}
            </Button>
            {editMode && (
              <Button size="sm" onClick={openNew}>
                <Plus className="w-4 h-4" /> Novo card
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((f) => {
          const Icon = getIcon(f.icone);
          return (
            <Card key={f.id} className="hover:shadow-lg hover:border-primary/20 transition-all group flex flex-col relative">
              {editMode && canEdit && (
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => openEdit(f)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => setToDelete(f)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              <CardContent className="p-6 flex flex-col items-center text-center gap-4 flex-1">
                <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${f.cor} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold text-foreground leading-tight">{f.titulo}</h3>
                <p className="text-sm text-muted-foreground">{f.descricao}</p>
                <Button className="mt-auto gap-2 w-full" asChild disabled={!f.link}>
                  <a
                    href={f.link || "#"}
                    target={f.abrir_nova_aba ? "_blank" : "_self"}
                    rel={f.abrir_nova_aba ? "noopener noreferrer" : undefined}
                  >
                    <ExternalLink className="w-4 h-4" /> {f.texto_botao}
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CardEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initial={editing}
        seccao="novos_pedidos"
        onSave={async (data) => {
          if (editing?.id) await updateCard(editing.id, data);
          else await createCard(data);
        }}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar card?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O card "{toDelete?.titulo}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (toDelete) { await deleteCard(toDelete.id); setToDelete(null); } }}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Comunicacao;
