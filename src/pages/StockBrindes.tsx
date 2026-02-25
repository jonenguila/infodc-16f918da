import { useState, useMemo } from "react";
import {
  Package, AlertTriangle, Search, Plus, Upload, RotateCcw,
  BarChart3, ClipboardList, History, Archive, FileSpreadsheet,
  CheckCircle2, ArrowDownCircle, ArrowUpCircle, CalendarIcon,
  FileDown, Users,
} from "lucide-react";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import { pt } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useStockStore } from "@/stores/stockStore";

// ─── OVERVIEW TAB ───
const OverviewTab = () => {
  const { produtos, pedidosLevantamento, movimentos, getEstado } = useStockStore();

  const totalProdutos = produtos.length;
  const totalUnidades = produtos.reduce((s, p) => s + p.stockAtual, 0);
  const abaixoMinimo = produtos.filter((p) => p.stockAtual < p.stockMinimo && p.stockAtual > 0).length;
  const esgotados = produtos.filter((p) => p.stockAtual === 0).length;
  const pedidosAtivos = pedidosLevantamento.filter((p) => p.estado === "Ativo").length;
  const totalLevantamentos = movimentos.filter((m) => m.tipo === "levantamento").length;

  const produtosCriticos = produtos
    .filter((p) => p.stockAtual < p.stockMinimo)
    .sort((a, b) => a.stockAtual - b.stockAtual);

  const cards = [
    { label: "Total de Produtos", value: totalProdutos, icon: Package, color: "text-primary" },
    { label: "Unidades em Stock", value: totalUnidades, icon: Archive, color: "text-primary" },
    { label: "Abaixo do Mínimo", value: abaixoMinimo + esgotados, icon: AlertTriangle, color: "text-destructive" },
    { label: "Pedidos Ativos", value: pedidosAtivos, icon: ClipboardList, color: "text-amber-600" },
    { label: "Total Levantamentos", value: totalLevantamentos, icon: ArrowUpCircle, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4 text-center">
              <c.icon className={`w-5 h-5 mx-auto mb-1 ${c.color}`} />
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-[11px] text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {produtosCriticos.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Produtos Abaixo do Stock Mínimo
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead>Produto</TableHead>
                <TableHead>Tipologia</TableHead>
                <TableHead>Stock Atual</TableHead>
                <TableHead>Stock Mínimo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosCriticos.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">{p.nome}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.tipologia}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${p.stockAtual === 0 ? "text-destructive" : "text-amber-600"}`}>
                      {p.stockAtual}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.stockMinimo}</TableCell>
                  <TableCell>
                    <Badge className={`border-0 text-[11px] ${p.stockAtual === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {getEstado(p)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            Últimos Movimentos
          </h3>
        </div>
        {pedidosLevantamento.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sem movimentos registados.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead>Produto</TableHead>
                <TableHead>Qtd. Levantada</TableHead>
                <TableHead>Qtd. Devolvida</TableHead>
                <TableHead>Consumo Real</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Evento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosLevantamento.map((ped) => (
                <TableRow key={ped.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">{ped.produtoNome}</TableCell>
                  <TableCell className="text-foreground">{ped.quantidadeLevantada}</TableCell>
                  <TableCell className="text-foreground">{ped.quantidadeDevolvida}</TableCell>
                  <TableCell className="font-semibold text-foreground">{ped.consumoReal}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{ped.data}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{ped.responsavel}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{ped.evento}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

// ─── STOCK TAB ───
const StockTab = () => {
  const { produtos, getEstado, importarExcel } = useStockStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const sorted = [...produtos]
    .filter((p) => p.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const order = { "Esgotado": 0, "Abaixo do mínimo": 1, "OK": 2 };
      return (order[getEstado(a)] ?? 2) - (order[getEstado(b)] ?? 2);
    });

  const estadoStyle: Record<string, string> = {
    "OK": "bg-green-100 text-green-700",
    "Abaixo do mínimo": "bg-amber-100 text-amber-700",
    "Esgotado": "bg-red-100 text-red-700",
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importarExcel(file);
    toast({ title: "Importação concluída", description: `Dados de "${file.name}" processados com sucesso.` });
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar produto..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <label>
          <Input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleImport} className="hidden" />
          <Button asChild variant="outline" className="gap-2">
            <span><FileSpreadsheet className="w-4 h-4" /> Atualizar via Excel</span>
          </Button>
        </label>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead>Produto</TableHead>
              <TableHead>Tipologia</TableHead>
              <TableHead>Stock Atual</TableHead>
              <TableHead>Stock Mínimo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            ) : sorted.map((p) => {
              const estado = getEstado(p);
              return (
                <TableRow key={p.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-medium text-sm text-foreground">{p.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.tipologia}</TableCell>
                  <TableCell>
                    <span className={`font-semibold text-sm ${p.stockAtual === 0 ? "text-destructive" : p.stockAtual < p.stockMinimo ? "text-amber-600" : "text-foreground"}`}>
                      {p.stockAtual}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.stockMinimo}</TableCell>
                  <TableCell>
                    <Badge className={`${estadoStyle[estado]} border-0 text-[11px]`}>{estado}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{sorted.length} produto(s)</p>
    </div>
  );
};

// ─── PEDIDOS ATIVOS TAB ───
const PedidosAtivosTab = () => {
  const { produtos, pedidosLevantamento, criarLevantamento, registarDevolucao } = useStockStore();
  const { toast } = useToast();

  const [levDialog, setLevDialog] = useState(false);
  const [devDialog, setDevDialog] = useState(false);
  const [devPedidoId, setDevPedidoId] = useState<number | null>(null);

  const [levProduto, setLevProduto] = useState("");
  const [levQtd, setLevQtd] = useState("");
  const [levEvento, setLevEvento] = useState("");
  const [levResp, setLevResp] = useState("");
  const [levData, setLevData] = useState(new Date().toISOString().slice(0, 10));

  const [devQtd, setDevQtd] = useState("");
  const [devData, setDevData] = useState(new Date().toISOString().slice(0, 10));

  const pedidosAtivos = pedidosLevantamento.filter((p) => p.estado === "Ativo");

  const handleLevantamento = () => {
    const err = criarLevantamento(Number(levProduto), Number(levQtd), levResp, levEvento, levData);
    if (err) {
      toast({ title: "Erro", description: err, variant: "destructive" });
      return;
    }
    toast({ title: "Levantamento registado", description: `${levQtd} unidades levantadas com sucesso.` });
    setLevDialog(false);
    setLevProduto(""); setLevQtd(""); setLevEvento(""); setLevResp("");
  };

  const handleDevolucao = () => {
    if (devPedidoId === null) return;
    const err = registarDevolucao(devPedidoId, Number(devQtd), devData);
    if (err) {
      toast({ title: "Erro", description: err, variant: "destructive" });
      return;
    }
    toast({ title: "Devolução registada", description: `${devQtd} unidades devolvidas. Pedido concluído.` });
    setDevDialog(false);
    setDevQtd("");
  };

  const openDevolucao = (pedidoId: number) => {
    setDevPedidoId(pedidoId);
    setDevQtd("");
    setDevData(new Date().toISOString().slice(0, 10));
    setDevDialog(true);
  };

  const selectedPedido = pedidosLevantamento.find((p) => p.id === devPedidoId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{pedidosAtivos.length} pedido(s) ativo(s)</p>
        <Button onClick={() => setLevDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Pedido de Levantamento
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead>Produto</TableHead>
              <TableHead>Levantado</TableHead>
              <TableHead>Devolvido</TableHead>
              <TableHead>Consumo Real</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidosAtivos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  Sem pedidos ativos.
                </TableCell>
              </TableRow>
            ) : pedidosAtivos.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-foreground">{p.produtoNome}</TableCell>
                <TableCell>{p.quantidadeLevantada}</TableCell>
                <TableCell>{p.quantidadeDevolvida}</TableCell>
                <TableCell className="font-semibold">{p.consumoReal}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{p.evento}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{p.responsavel}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{p.data}</TableCell>
                <TableCell>
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-[11px]">Ativo</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => openDevolucao(p.id)}>
                    <RotateCcw className="w-3 h-3" /> Devolver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Levantamento Dialog */}
      <Dialog open={levDialog} onOpenChange={setLevDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Pedido de Levantamento</DialogTitle>
            <DialogDescription>Registar um levantamento de brindes do stock.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Produto</Label>
              <Select value={levProduto} onValueChange={setLevProduto}>
                <SelectTrigger><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
                <SelectContent>
                  {produtos.filter((p) => p.stockAtual > 0).map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nome} (stock: {p.stockAtual})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Quantidade</Label>
                <Input type="number" min={1} value={levQtd} onChange={(e) => setLevQtd(e.target.value)} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input type="date" value={levData} onChange={(e) => setLevData(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Evento / Motivo</Label>
              <Input value={levEvento} onChange={(e) => setLevEvento(e.target.value)} placeholder="Ex: Conferência Web Summit" />
            </div>
            <div className="grid gap-2">
              <Label>Responsável</Label>
              <Input value={levResp} onChange={(e) => setLevResp(e.target.value)} placeholder="Nome do responsável" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLevDialog(false)}>Cancelar</Button>
            <Button onClick={handleLevantamento} disabled={!levProduto || !levQtd || !levEvento || !levResp}>
              Registar Levantamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Devolução Dialog */}
      <Dialog open={devDialog} onOpenChange={setDevDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registar Devolução</DialogTitle>
            <DialogDescription>
              {selectedPedido && (
                <>Produto: <strong>{selectedPedido.produtoNome}</strong> — Levantou {selectedPedido.quantidadeLevantada}, já devolveu {selectedPedido.quantidadeDevolvida}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Quantidade a devolver</Label>
              <Input
                type="number"
                min={1}
                max={selectedPedido ? selectedPedido.quantidadeLevantada - selectedPedido.quantidadeDevolvida : 0}
                value={devQtd}
                onChange={(e) => setDevQtd(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label>Data</Label>
              <Input type="date" value={devData} onChange={(e) => setDevData(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDevDialog(false)}>Cancelar</Button>
            <Button onClick={handleDevolucao} disabled={!devQtd}>Registar Devolução</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── HISTÓRICO TAB ───
type HistFilterMode = "all" | "month" | "year" | "range";

interface HistoricoRow {
  data: string;
  documento: string;
  evento: string;
  produto: string;
  quantidade: number;
  responsavel: string;
  tipo: "Pedido" | "Devolução";
  observacoes: string;
}

const HistoricoTab = () => {
  const { pedidos, pedidosLevantamento, movimentos } = useStockStore();

  const [filterMode, setFilterMode] = useState<HistFilterMode>("all");
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [selectedYear, setSelectedYear] = useState(() => format(new Date(), "yyyy"));
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [collaborator, setCollaborator] = useState("all");
  const [applied, setApplied] = useState(false);

  // Build unified rows from pedidos + movimentos
  const allRows: HistoricoRow[] = useMemo(() => {
    const rows: HistoricoRow[] = [];

    pedidos.forEach((p) => {
      p.produtos.forEach((pp) => {
        rows.push({
          data: p.criadoEm ? format(parseISO(p.criadoEm), "yyyy-MM-dd") : p.dataPedido,
          documento: `Pedido #${p.id}`,
          evento: p.nomeEvento || p.tipoEvento,
          produto: pp.produtoNome,
          quantidade: pp.quantidade,
          responsavel: p.nomeRequisitante || p.responsavelLevantamento,
          tipo: "Pedido",
          observacoes: p.observacoes || "",
        });
      });
    });

    movimentos.filter((m) => m.tipo === "devolucao").forEach((m) => {
      rows.push({
        data: m.data,
        documento: `Devolução #${m.id}`,
        evento: m.evento,
        produto: m.produtoNome,
        quantidade: m.quantidade,
        responsavel: m.responsavel,
        tipo: "Devolução",
        observacoes: "",
      });
    });

    // Also include concluded levantamentos not already covered
    pedidosLevantamento.filter((p) => p.estado === "Concluído").forEach((p) => {
      const alreadyHasMovimento = movimentos.some((m) => m.tipo === "levantamento" && m.produtoId === p.produtoId && m.evento === p.evento);
      if (!alreadyHasMovimento) {
        rows.push({
          data: p.data,
          documento: `Levantamento #${p.id}`,
          evento: p.evento,
          produto: p.produtoNome,
          quantidade: p.quantidadeLevantada,
          responsavel: p.responsavel,
          tipo: "Pedido",
          observacoes: `Devolvido: ${p.quantidadeDevolvida} | Consumo: ${p.consumoReal}`,
        });
      }
    });

    return rows.sort((a, b) => b.data.localeCompare(a.data));
  }, [pedidos, movimentos, pedidosLevantamento]);

  // All unique collaborators
  const collaborators = useMemo(() => {
    const set = new Set(allRows.map((r) => r.responsavel).filter(Boolean));
    return Array.from(set).sort();
  }, [allRows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    let rows = allRows;

    if (filterMode === "month" || (filterMode === "all" && applied)) {
      // no date filter for "all"
    }

    if (filterMode === "month") {
      const [y, m] = selectedMonth.split("-").map(Number);
      const start = startOfMonth(new Date(y, m - 1));
      const end = endOfMonth(new Date(y, m - 1));
      rows = rows.filter((r) => {
        const d = parseISO(r.data);
        return isWithinInterval(d, { start, end });
      });
    } else if (filterMode === "year") {
      const y = parseInt(selectedYear);
      const start = startOfYear(new Date(y, 0));
      const end = endOfYear(new Date(y, 0));
      rows = rows.filter((r) => {
        const d = parseISO(r.data);
        return isWithinInterval(d, { start, end });
      });
    } else if (filterMode === "range" && dateFrom && dateTo) {
      rows = rows.filter((r) => {
        const d = parseISO(r.data);
        return isWithinInterval(d, { start: dateFrom, end: dateTo });
      });
    }

    if (collaborator !== "all") {
      rows = rows.filter((r) => r.responsavel === collaborator);
    }

    return rows;
  }, [allRows, filterMode, selectedMonth, selectedYear, dateFrom, dateTo, collaborator, applied]);

  // Summary
  const totalMovimentos = filteredRows.length;
  const totalUnidades = filteredRows.reduce((s, r) => s + r.quantidade, 0);
  const totalColaboradores = new Set(filteredRows.map((r) => r.responsavel).filter(Boolean)).size;

  // Generate filename
  const generateFilename = (ext: string) => {
    let name = "historico_brindes";
    if (filterMode === "month") name += `_${selectedMonth.replace("-", "_")}`;
    else if (filterMode === "year") name += `_${selectedYear}`;
    if (collaborator !== "all") name += `_colaborador_${collaborator.toLowerCase().replace(/\s+/g, "_")}`;
    return `${name}.${ext}`;
  };

  const exportHeaders = ["Data", "Documento", "Evento", "Produto", "Quantidade", "Responsável", "Tipo", "Observações"];

  const handleExportExcel = () => {
    if (filteredRows.length === 0) return;
    const csvRows = [exportHeaders.join(";")];
    filteredRows.forEach((r) => {
      csvRows.push([r.data, r.documento, r.evento, r.produto, r.quantidade, r.responsavel, r.tipo, r.observacoes].join(";"));
    });
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generateFilename("csv");
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (filteredRows.length === 0) return;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Histórico de Brindes", 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [exportHeaders],
      body: filteredRows.map((r) => [r.data, r.documento, r.evento, r.produto, String(r.quantidade), r.responsavel, r.tipo, r.observacoes]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(generateFilename("pdf"));
  };

  // Generate month options (last 24 months)
  const monthOptions = useMemo(() => {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const d = subMonths(now, i);
      opts.push({ value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy", { locale: pt }) });
    }
    return opts;
  }, []);

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => String(now - i));
  }, []);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{totalMovimentos}</p>
              <p className="text-[11px] text-muted-foreground">Total Movimentos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{totalUnidades}</p>
              <p className="text-[11px] text-muted-foreground">Total Unidades</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{totalColaboradores}</p>
              <p className="text-[11px] text-muted-foreground">Colaboradores Envolvidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Export */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Filter mode */}
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Filtrar por</Label>
            <Select value={filterMode} onValueChange={(v) => setFilterMode(v as HistFilterMode)}>
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="year">Ano</SelectItem>
                <SelectItem value="range">Intervalo de Datas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filterMode === "month" && (
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Mês</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px] h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filterMode === "year" && (
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Ano</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filterMode === "range" && (
            <>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">De</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("h-9 text-xs gap-1 w-[140px] justify-start", !dateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Até</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("h-9 text-xs gap-1 w-[140px] justify-start", !dateTo && "text-muted-foreground")}>
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {dateTo ? format(dateTo, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          {/* Collaborator filter */}
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Colaborador</Label>
            <Select value={collaborator} onValueChange={setCollaborator}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {collaborators.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Export buttons */}
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={handleExportExcel} disabled={filteredRows.length === 0}>
            <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar Excel
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={handleExportPDF} disabled={filteredRows.length === 0}>
            <FileDown className="w-3.5 h-3.5" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead>Data</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Sem histórico para o período selecionado.
                </TableCell>
              </TableRow>
            ) : filteredRows.map((r, i) => (
              <TableRow key={i} className="hover:bg-muted/30">
                <TableCell className="text-muted-foreground text-sm">{r.data}</TableCell>
                <TableCell className="font-medium text-foreground text-sm">{r.documento}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{r.evento}</TableCell>
                <TableCell className="text-foreground text-sm">{r.produto}</TableCell>
                <TableCell className="font-semibold text-foreground">{r.quantidade}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{r.responsavel}</TableCell>
                <TableCell>
                  <Badge className={cn("border-0 text-[11px]", r.tipo === "Pedido" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700")}>
                    {r.tipo}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">{r.observacoes || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">{filteredRows.length} registo(s)</p>
    </div>
  );
};
const StockBrindes = ({ defaultTab = "overview" }: { defaultTab?: string }) => {
  return (
    <div className="p-8 animate-fade-in bg-background min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Brindes</h1>
        <p className="text-sm text-muted-foreground mt-1">Módulo completo de gestão de stock de brindes</p>
      </div>

      <Tabs defaultValue={defaultTab} key={defaultTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-2"><BarChart3 className="w-4 h-4" /> Overview</TabsTrigger>
          <TabsTrigger value="stock" className="gap-2"><Package className="w-4 h-4" /> Stock</TabsTrigger>
          <TabsTrigger value="pedidos" className="gap-2"><ClipboardList className="w-4 h-4" /> Pedidos Ativos</TabsTrigger>
          <TabsTrigger value="historico" className="gap-2"><History className="w-4 h-4" /> Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="stock"><StockTab /></TabsContent>
        <TabsContent value="pedidos"><PedidosAtivosTab /></TabsContent>
        <TabsContent value="historico"><HistoricoTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default StockBrindes;
