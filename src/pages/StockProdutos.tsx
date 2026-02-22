import { useState } from "react";
import { Search, Plus, Edit, Trash2, Package, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const delegacoesDefault = ["Lisboa", "Porto", "Coimbra", "Faro", "Braga", "Aveiro"];
const categoriasDefault = ["Escritório", "Vestuário", "Lifestyle", "Tecnologia"];

interface Produto {
  id: number;
  nome: string;
  categoria: string;
  delegacao: string;
  quantidade: number;
  minimo: number;
  estado: "Disponível" | "Baixo Stock" | "Esgotado";
}

const mockProdutos: Produto[] = [
  { id: 1, nome: "Caneta Data CoLAB", categoria: "Escritório", delegacao: "Lisboa", quantidade: 150, minimo: 30, estado: "Disponível" },
  { id: 2, nome: "Bloco de Notas A5", categoria: "Escritório", delegacao: "Lisboa", quantidade: 45, minimo: 20, estado: "Disponível" },
  { id: 3, nome: "Mochila Corporativa", categoria: "Vestuário", delegacao: "Porto", quantidade: 12, minimo: 10, estado: "Baixo Stock" },
  { id: 4, nome: "T-Shirt Data CoLAB", categoria: "Vestuário", delegacao: "Porto", quantidade: 0, minimo: 15, estado: "Esgotado" },
  { id: 5, nome: "Garrafa Termos", categoria: "Lifestyle", delegacao: "Coimbra", quantidade: 25, minimo: 10, estado: "Disponível" },
  { id: 6, nome: "Pen USB 32GB", categoria: "Tecnologia", delegacao: "Coimbra", quantidade: 8, minimo: 20, estado: "Baixo Stock" },
  { id: 7, nome: "Câmara Selfie Ring", categoria: "Tecnologia", delegacao: "Faro", quantidade: 5, minimo: 10, estado: "Baixo Stock" },
  { id: 8, nome: "Calendário 2025", categoria: "Escritório", delegacao: "Braga", quantidade: 60, minimo: 15, estado: "Disponível" },
  { id: 9, nome: "Tote Bag", categoria: "Lifestyle", delegacao: "Aveiro", quantidade: 0, minimo: 20, estado: "Esgotado" },
];

const estadoStyle: Record<string, string> = {
  "Disponível": "bg-green-100 text-green-700",
  "Baixo Stock": "bg-amber-100 text-amber-700",
  "Esgotado": "bg-red-100 text-red-700",
};

const StockProdutos = () => {
  const [search, setSearch] = useState("");
  const [filterDelegacao, setFilterDelegacao] = useState("Todas");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({ nome: "", categoria: "", delegacao: "", quantidade: "", minimo: "" });

  const computeEstado = (qty: number, min: number): Produto["estado"] => {
    if (qty === 0) return "Esgotado";
    if (qty < min) return "Baixo Stock";
    return "Disponível";
  };

  const filtered = produtos.filter((b) => {
    const matchSearch = b.nome.toLowerCase().includes(search.toLowerCase());
    const matchDel = filterDelegacao === "Todas" || b.delegacao === filterDelegacao;
    const matchCat = filterCategoria === "Todas" || b.categoria === filterCategoria;
    const matchEst = filterEstado === "Todos" || b.estado === filterEstado;
    return matchSearch && matchDel && matchCat && matchEst;
  });

  const resumo = delegacoesDefault.map((del) => {
    const items = produtos.filter((b) => b.delegacao === del);
    return {
      del,
      total: items.reduce((s, b) => s + b.quantidade, 0),
      esgotados: items.filter((b) => b.estado === "Esgotado").length,
      baixo: items.filter((b) => b.estado === "Baixo Stock").length,
    };
  }).filter((r) => r.total > 0 || r.esgotados > 0 || r.baixo > 0);

  const openNew = () => {
    setEditItem(null);
    setFormData({ nome: "", categoria: "", delegacao: delegacoesDefault[0], quantidade: "", minimo: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: Produto) => {
    setEditItem(item);
    setFormData({ nome: item.nome, categoria: item.categoria, delegacao: item.delegacao, quantidade: String(item.quantidade), minimo: String(item.minimo) });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const qty = Number(formData.quantidade);
    const min = Number(formData.minimo);
    const estado = computeEstado(qty, min);
    if (editItem) {
      setProdutos((prev) => prev.map((b) => b.id === editItem.id ? { ...b, ...formData, quantidade: qty, minimo: min, estado } : b));
    } else {
      setProdutos((prev) => [...prev, { id: Date.now(), nome: formData.nome, categoria: formData.categoria, delegacao: formData.delegacao, quantidade: qty, minimo: min, estado }]);
    }
    setDialogOpen(false);
  };

  return (
    <div className="p-8 animate-fade-in bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos em Stock</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão de inventário de produtos por delegação</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Novo Produto</Button>
      </div>

      {/* Resumo cards por delegação */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {resumo.map((r) => (
          <Card key={r.del} className="border hover:border-primary/30 transition-all cursor-pointer" onClick={() => setFilterDelegacao(r.del === filterDelegacao ? "Todas" : r.del)}>
            <CardContent className="p-3 text-center">
              <Building2 className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs font-semibold text-foreground">{r.del}</p>
              <p className="text-lg font-bold text-foreground">{r.total}</p>
              <p className="text-[10px] text-muted-foreground">unidades</p>
              {(r.esgotados > 0 || r.baixo > 0) && (
                <div className="mt-1 flex justify-center gap-1">
                  {r.esgotados > 0 && <span className="text-[9px] bg-destructive/10 text-destructive rounded px-1">{r.esgotados} esg.</span>}
                  {r.baixo > 0 && <span className="text-[9px] bg-secondary text-muted-foreground rounded px-1">{r.baixo} baixo</span>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar produto..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterDelegacao} onValueChange={setFilterDelegacao}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Delegação" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas as Delegações</SelectItem>
            {delegacoesDefault.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas</SelectItem>
            {categoriasDefault.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os Estados</SelectItem>
            <SelectItem value="Disponível">Disponível</SelectItem>
            <SelectItem value="Baixo Stock">Baixo Stock</SelectItem>
            <SelectItem value="Esgotado">Esgotado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead className="w-8">#</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Delegação</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Stock Mínimo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Nenhum produto encontrado com os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : filtered.map((b) => (
              <TableRow key={b.id} className="hover:bg-muted/30">
                <TableCell className="text-muted-foreground text-xs">{b.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-medium text-sm text-foreground">{b.nome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{b.categoria}</TableCell>
                <TableCell>
                  <span className="text-xs font-medium bg-secondary px-2 py-0.5 rounded-full">{b.delegacao}</span>
                </TableCell>
                <TableCell>
                  <span className={`font-semibold text-sm ${b.quantidade === 0 ? "text-destructive" : b.quantidade < b.minimo ? "text-yellow-600" : "text-foreground"}`}>
                    {b.quantidade}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{b.minimo}</TableCell>
                <TableCell>
                  <Badge className={`${estadoStyle[b.estado]} border-0 text-[11px]`}>{b.estado}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setProdutos((prev) => prev.filter((x) => x.id !== b.id))}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground mt-3">{filtered.length} resultado(s) de {produtos.length} produtos</p>

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>Preencha as informações do produto.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nome do Produto</Label>
              <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: Caneta Data CoLAB" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    {categoriasDefault.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Delegação</Label>
                <Select value={formData.delegacao} onValueChange={(v) => setFormData({ ...formData, delegacao: v })}>
                  <SelectTrigger><SelectValue placeholder="Delegação" /></SelectTrigger>
                  <SelectContent>
                    {delegacoesDefault.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Quantidade</Label>
                <Input type="number" min={0} value={formData.quantidade} onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>Stock Mínimo</Label>
                <Input type="number" min={0} value={formData.minimo} onChange={(e) => setFormData({ ...formData, minimo: e.target.value })} placeholder="0" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formData.nome || !formData.categoria || !formData.delegacao}>
              {editItem ? "Guardar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockProdutos;
