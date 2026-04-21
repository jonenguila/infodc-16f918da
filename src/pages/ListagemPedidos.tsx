import { useState } from "react";
import { format } from "date-fns";
import { Search, ClipboardList, CalendarIcon, Eye, Download, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useStockStore, type Pedido } from "@/stores/stockStore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const estadoStyles: Record<string, string> = {
  Pendente: "bg-amber-100 text-amber-700",
  Entregue: "bg-green-100 text-green-700",
  Cancelado: "bg-red-100 text-red-700",
};

const prioridadeStyles: Record<string, string> = {
  Baixa: "bg-secondary text-muted-foreground",
  Média: "bg-blue-100 text-blue-700",
  Alta: "bg-amber-100 text-amber-700",
  Urgente: "bg-red-100 text-red-700",
};

const ITEMS_PER_PAGE = 10;

const ListagemPedidos = () => {
  const { pedidos, atualizarEstadoPedido, editarPedido, eliminarPedido } = useStockStore();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdminOrGestor = user?.perfil === "Administrador" || user?.perfil === "Gestor";
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("todos");
  const [filtroDataDe, setFiltroDataDe] = useState<Date>();
  const [filtroDataAte, setFiltroDataAte] = useState<Date>();
  const [detalhePedido, setDetalhePedido] = useState<Pedido | null>(null);
  const [pedidoCancelar, setPedidoCancelar] = useState<Pedido | null>(null);
  const [pedidoEditar, setPedidoEditar] = useState<Pedido | null>(null);
  const [pedidoEliminar, setPedidoEliminar] = useState<Pedido | null>(null);
  const [reporStockEliminar, setReporStockEliminar] = useState(true);
  const [editForm, setEditForm] = useState({
    nomeRequisitante: "",
    email: "",
    dataPedido: "",
    tipoEvento: "",
    nomeEvento: "",
    responsavelLevantamento: "",
    prioridade: "Média" as Pedido["prioridade"],
    observacoes: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingPedido, setDeletingPedido] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const openEditar = (p: Pedido) => {
    setEditForm({
      nomeRequisitante: p.nomeRequisitante,
      email: p.email,
      dataPedido: p.dataPedido,
      tipoEvento: p.tipoEvento || "",
      nomeEvento: p.nomeEvento || "",
      responsavelLevantamento: p.responsavelLevantamento || "",
      prioridade: p.prioridade,
      observacoes: p.observacoes || "",
    });
    setPedidoEditar(p);
  };

  const handleSaveEdit = async () => {
    if (!pedidoEditar) return;
    if (!editForm.nomeRequisitante.trim() || !editForm.email.trim() || !editForm.dataPedido) {
      toast({ title: "Campos obrigatórios em falta", variant: "destructive" });
      return;
    }
    setSavingEdit(true);
    const err = await editarPedido(pedidoEditar.id, editForm);
    setSavingEdit(false);
    if (err) {
      toast({ title: "Erro ao guardar", description: err, variant: "destructive" });
      return;
    }
    toast({ title: "Pedido atualizado com sucesso" });
    setPedidoEditar(null);
  };

  const handleDelete = async () => {
    if (!pedidoEliminar) return;
    setDeletingPedido(true);
    const err = await eliminarPedido(pedidoEliminar.id, reporStockEliminar);
    setDeletingPedido(false);
    if (err) {
      toast({ title: "Erro ao eliminar", description: err, variant: "destructive" });
      return;
    }
    toast({ title: "Pedido eliminado" });
    setPedidoEliminar(null);
    setReporStockEliminar(true);
  };


  const filtered = pedidos.filter((p) => {
    if (filtroEstado !== "todos" && p.estado !== filtroEstado) return false;
    if (filtroPrioridade !== "todos" && p.prioridade !== filtroPrioridade) return false;
    if (filtroDataDe && new Date(p.dataPedido) < filtroDataDe) return false;
    if (filtroDataAte) {
      const ate = new Date(filtroDataAte);
      ate.setHours(23, 59, 59);
      if (new Date(p.dataPedido) > ate) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      return p.nomeRequisitante.toLowerCase().includes(s) ||
        p.tipoEvento.toLowerCase().includes(s) ||
        p.destino.toLowerCase().includes(s) ||
        p.produtos.some((pp) => pp.produtoNome.toLowerCase().includes(s));
    }
    return true;
  }).sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
  // Reset page when filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedItems = filtered.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE);

  const totalProdutos = (p: Pedido) => p.produtos.reduce((s, pp) => s + pp.quantidade, 0);

  const exportarExcel = () => {
    if (filtered.length === 0) return;
    const header = ["Data", "Requisitante", "Email", "Tipo Evento", "Nome Evento", "Prioridade", "Estado", "Produtos", "Total Qtd."];
    const rows = filtered.map((p) => [
      format(new Date(p.dataPedido), "dd/MM/yyyy"),
      p.nomeRequisitante,
      p.email || "",
      p.tipoEvento || "",
      (p as any).nomeEvento || "",
      p.prioridade,
      p.estado,
      p.produtos.map((pp) => `${pp.produtoNome} (${pp.quantidade})`).join("; "),
      String(totalProdutos(p)),
    ]);
    const csv = "\uFEFF" + [header, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const DateFilter = ({ label, value, onChange }: { label: string; value: Date | undefined; onChange: (d: Date | undefined) => void }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2 text-xs", !value && "text-muted-foreground")}>
          <CalendarIcon className="w-3 h-3" />
          {value ? format(value, "dd/MM/yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" />
          Listagem de Pedidos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Todos os pedidos de stock criados</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: pedidos.length, color: "text-primary" },
          { label: "Pendentes", value: pedidos.filter((p) => p.estado === "Pendente").length, color: "text-amber-600" },
          { label: "Entregues", value: pedidos.filter((p) => p.estado === "Entregue").length, color: "text-green-600" },
          { label: "Cancelados", value: pedidos.filter((p) => p.estado === "Cancelado").length, color: "text-red-600" },
        ].map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-[11px] text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar pedido..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 h-9" />
        </div>
        <Select value={filtroEstado} onValueChange={(v) => { setFiltroEstado(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Entregue">Entregue</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroPrioridade} onValueChange={(v) => { setFiltroPrioridade(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="Baixa">Baixa</SelectItem>
            <SelectItem value="Média">Média</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
        <DateFilter label="De" value={filtroDataDe} onChange={setFiltroDataDe} />
        <DateFilter label="Até" value={filtroDataAte} onChange={setFiltroDataAte} />
        {(filtroEstado !== "todos" || filtroPrioridade !== "todos" || filtroDataDe || filtroDataAte) && (
          <Button variant="ghost" size="sm" onClick={() => { setFiltroEstado("todos"); setFiltroPrioridade("todos"); setFiltroDataDe(undefined); setFiltroDataAte(undefined); }}>
            Limpar filtros
          </Button>
        )}
        <Button variant="outline" size="sm" className="gap-2 ml-auto" onClick={exportarExcel}>
          <Download className="w-3 h-3" /> Exportar Excel
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead>Data</TableHead>
              <TableHead>Requisitante</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead className="text-center">Produtos</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Sem pedidos registados.
                </TableCell>
              </TableRow>
            ) : paginatedItems.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/30">
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(p.dataPedido), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="font-medium text-foreground">{p.nomeRequisitante}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{(p as any).nomeEvento || p.tipoEvento || "—"}</TableCell>
                <TableCell className="text-center font-medium text-foreground">{totalProdutos(p)}</TableCell>
                <TableCell>
                  <Badge className={`${prioridadeStyles[p.prioridade]} border-0 text-[11px]`}>{p.prioridade}</Badge>
                </TableCell>
                <TableCell>
                  <Select value={p.estado} onValueChange={(v) => {
                    if (v === "Cancelado") {
                      setPedidoCancelar(p);
                    } else {
                      atualizarEstadoPedido(p.id, v as Pedido["estado"]);
                    }
                  }}>
                    <SelectTrigger className="h-7 w-[130px] text-xs border-0 p-0">
                      <Badge className={`${estadoStyles[p.estado]} border-0 text-[11px]`}>{p.estado}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Entregue">Entregue</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver detalhes" onClick={() => setDetalhePedido(p)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar pedido" onClick={() => openEditar(p)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Eliminar pedido" onClick={() => { setPedidoEliminar(p); setReporStockEliminar(p.estado === "Pendente"); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">
          {filtered.length} pedido(s) · Página {safeCurrentPage} de {totalPages}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage(safeCurrentPage - 1)}>
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-2 text-xs text-muted-foreground">…</span>
                ) : (
                  <Button key={p} variant={p === safeCurrentPage ? "default" : "outline"} size="sm" className="w-8 h-8 p-0" onClick={() => setCurrentPage(p as number)}>
                    {p}
                  </Button>
                )
              )}
            <Button variant="outline" size="sm" disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage(safeCurrentPage + 1)}>
              Seguinte
            </Button>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!detalhePedido} onOpenChange={() => setDetalhePedido(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {detalhePedido && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Data:</span> <strong>{format(new Date(detalhePedido.dataPedido), "dd/MM/yyyy")}</strong></div>
                <div><span className="text-muted-foreground">Requisitante:</span> <strong>{detalhePedido.nomeRequisitante}</strong></div>
                <div><span className="text-muted-foreground">Email:</span> {detalhePedido.email || "—"}</div>
                <div><span className="text-muted-foreground">Tipo de Evento:</span> {detalhePedido.tipoEvento || "—"}</div>
                <div><span className="text-muted-foreground">Nome do Evento:</span> {(detalhePedido as any).nomeEvento || "—"}</div>
                <div><span className="text-muted-foreground">Responsável:</span> {detalhePedido.responsavelLevantamento || "—"}</div>
                <div><span className="text-muted-foreground">Prioridade:</span> <Badge className={`${prioridadeStyles[detalhePedido.prioridade]} border-0 text-[11px]`}>{detalhePedido.prioridade}</Badge></div>
              </div>
              {detalhePedido.observacoes && (
                <div><span className="text-muted-foreground">Observações:</span> <p className="mt-1">{detalhePedido.observacoes}</p></div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Produtos ({detalhePedido.produtos.length})</h4>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30">
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detalhePedido.produtos.map((pp, i) => (
                      <TableRow key={i}>
                        <TableCell>{pp.produtoNome}</TableCell>
                        <TableCell className="text-right font-medium">{pp.quantidade}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation */}
      <AlertDialog open={!!pedidoCancelar} onOpenChange={() => setPedidoCancelar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar pedido?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Tem a certeza que pretende cancelar este pedido de <strong>{pedidoCancelar?.nomeRequisitante}</strong>?</p>
              {pedidoCancelar && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-amber-800 dark:text-amber-300 text-sm">
                  <strong>⚠ Stock será reposto:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {pedidoCancelar.produtos.map((pp, i) => (
                      <li key={i}>{pp.produtoNome}: +{pp.quantidade} un.</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Esta ação não pode ser revertida.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => {
              if (pedidoCancelar) {
                atualizarEstadoPedido(pedidoCancelar.id, "Cancelado");
                setPedidoCancelar(null);
              }
            }}>
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog open={!!pedidoEditar} onOpenChange={(o) => !o && setPedidoEditar(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Pedido {pedidoEditar?.numero}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ed-nome">Requisitante *</Label>
                <Input id="ed-nome" value={editForm.nomeRequisitante} onChange={(e) => setEditForm((f) => ({ ...f, nomeRequisitante: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ed-email">Email *</Label>
                <Input id="ed-email" type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ed-data">Data do Pedido *</Label>
                <Input id="ed-data" type="date" value={editForm.dataPedido} onChange={(e) => setEditForm((f) => ({ ...f, dataPedido: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ed-prio">Prioridade</Label>
                <Select value={editForm.prioridade} onValueChange={(v) => setEditForm((f) => ({ ...f, prioridade: v as Pedido["prioridade"] }))}>
                  <SelectTrigger id="ed-prio"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ed-tipo">Tipo de Evento</Label>
                <Input id="ed-tipo" value={editForm.tipoEvento} onChange={(e) => setEditForm((f) => ({ ...f, tipoEvento: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ed-evento">Nome do Evento</Label>
                <Input id="ed-evento" value={editForm.nomeEvento} onChange={(e) => setEditForm((f) => ({ ...f, nomeEvento: e.target.value }))} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label htmlFor="ed-resp">Responsável pelo Levantamento</Label>
                <Input id="ed-resp" value={editForm.responsavelLevantamento} onChange={(e) => setEditForm((f) => ({ ...f, responsavelLevantamento: e.target.value }))} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label htmlFor="ed-obs">Observações</Label>
                <Textarea id="ed-obs" rows={3} value={editForm.observacoes} onChange={(e) => setEditForm((f) => ({ ...f, observacoes: e.target.value }))} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Nota: a edição não altera produtos, quantidades nem o estado do pedido (use o seletor da listagem para alterar o estado).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPedidoEditar(null)} disabled={savingEdit}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>{savingEdit ? "A guardar..." : "Guardar alterações"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!pedidoEliminar} onOpenChange={(o) => { if (!o) { setPedidoEliminar(null); setReporStockEliminar(true); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar pedido {pedidoEliminar?.numero}?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Esta ação eliminará permanentemente o pedido de <strong>{pedidoEliminar?.nomeRequisitante}</strong> da base de dados.
              </span>
              {pedidoEliminar?.estado === "Pendente" && (
                <span className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-amber-800 dark:text-amber-300">
                  <Checkbox
                    id="repor-stock"
                    checked={reporStockEliminar}
                    onCheckedChange={(v) => setReporStockEliminar(v === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="repor-stock" className="text-sm cursor-pointer">
                    Repor stock dos produtos (o pedido está Pendente — recomendado).
                  </label>
                </span>
              )}
              <span className="block text-xs text-muted-foreground">Esta ação não pode ser revertida.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingPedido}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingPedido}
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
            >
              {deletingPedido ? "A eliminar..." : "Eliminar definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListagemPedidos;
