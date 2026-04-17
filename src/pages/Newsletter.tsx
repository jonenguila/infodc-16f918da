import { useState } from "react";
import { Download, Calendar, Pencil, Plus, Trash2, Settings2 } from "lucide-react";
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

const Newsletter = () => {
  const { user } = useAuth();
  const canEdit = user?.perfil === "Administrador" || user?.perfil === "Gestor";
  const { cards, createCard, updateCard, deleteCard } = useComunicacaoCards("newsletter");

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
          <h1 className="text-2xl font-bold text-foreground">Newsletter</h1>
          <p className="text-sm text-muted-foreground mt-1">Biblioteca de newsletters em PDF</p>
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
        {cards.map((n) => {
          const Icon = getIcon(n.icone);
          const dataFmt = n.updated_at ? new Date(n.updated_at).toLocaleDateString("pt-PT") : "Não aplicável";
          return (
            <Card key={n.id} className="hover:shadow-lg hover:border-primary/20 transition-all group flex flex-col relative">
              {editMode && canEdit && (
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => openEdit(n)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => setToDelete(n)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              <CardContent className="p-6 flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${n.cor} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                      {n.titulo}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{dataFmt}</span>
                    </div>
                  </div>
                </div>

                {n.descricao && <p className="text-sm text-muted-foreground">{n.descricao}</p>}

                <div className="mt-auto pt-2">
                  {n.link ? (
                    <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                      <a
                        href={n.link}
                        target={n.abrir_nova_aba ? "_blank" : "_self"}
                        rel={n.abrir_nova_aba ? "noopener noreferrer" : undefined}
                      >
                        <Download className="w-4 h-4" /> {n.texto_botao}
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full gap-2" disabled>
                      <Download className="w-4 h-4" /> PDF não disponível
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CardEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initial={editing}
        seccao="newsletter"
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

export default Newsletter;
