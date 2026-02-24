import { useState } from "react";
import {
  RotateCcw, FileText, Search, Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useStockStore } from "@/stores/stockStore";

interface DocumentoDevolucao {
  id: number;
  nome: string;
  data: string;
  responsavel: string;
  categoria: string;
  produto: string;
  produtoId: number;
  quantidade: number;
  pedidoId: number;
}

let _documentos: DocumentoDevolucao[] = [];

const StockDevolucao = () => {
  const { produtos, pedidos, registarDevolucao } = useStockStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, setTick] = useState(0);

  // Form state
  const [nome, setNome] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [responsavel, setResponsavel] = useState("");
  const [categoria, setCategoria] = useState("");
  const [pedidoId, setPedidoId] = useState("");
  const [quantidade, setQuantidade] = useState("");

  const pedidosAtivos = pedidos.filter((p) => p.estado === "Ativo");
  const selectedPedido = pedidos.find((p) => p.id === Number(pedidoId));
  const maxDevolver = selectedPedido
    ? selectedPedido.quantidadeLevantada - selectedPedido.quantidadeDevolvida
    : 0;

  const categorias = [...new Set(produtos.map((p) => p.tipologia))];

  const filteredDocs = _documentos.filter(
    (d) =>
      d.nome.toLowerCase().includes(search.toLowerCase()) ||
      d.produto.toLowerCase().includes(search.toLowerCase()) ||
      d.responsavel.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!pedidoId || !quantidade || !nome || !responsavel) return;

    const qtd = Number(quantidade);
    const err = registarDevolucao(Number(pedidoId), qtd, data);
    if (err) {
      toast({ title: "Erro", description: err, variant: "destructive" });
      return;
    }

    const pedido = pedidos.find((p) => p.id === Number(pedidoId));
    const produto = produtos.find((p) => p.id === pedido?.produtoId);

    _documentos = [
      {
        id: Date.now(),
        nome,
        data,
        responsavel,
        categoria: categoria || produto?.tipologia || "Geral",
        produto: pedido?.produtoNome || "",
        produtoId: pedido?.produtoId || 0,
        quantidade: qtd,
        pedidoId: Number(pedidoId),
      },
      ..._documentos,
    ];

    toast({
      title: "Devolução registada",
      description: `Documento "${nome}" criado — ${qtd} unidades devolvidas.`,
    });

    setDialogOpen(false);
    setNome("");
    setResponsavel("");
    setCategoria("");
    setPedidoId("");
    setQuantidade("");
    setTick((t) => t + 1);
  };

  return (
    <div className="p-8 animate-fade-in bg-background min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-primary" />
          Devoluções
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Documentos de devolução de brindes
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{_documentos.length}</p>
            <p className="text-[11px] text-muted-foreground">Total Documentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <RotateCcw className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {_documentos.reduce((s, d) => s + d.quantidade, 0)}
            </p>
            <p className="text-[11px] text-muted-foreground">Unidades Devolvidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-5 h-5 mx-auto mb-1 text-amber-600" />
            <p className="text-2xl font-bold text-foreground">{pedidosAtivos.length}</p>
            <p className="text-[11px] text-muted-foreground">Pedidos Ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Documento de Devolução
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Sem documentos de devolução registados.
                </TableCell>
              </TableRow>
            ) : (
              filteredDocs.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                      </div>
                      {doc.nome}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{doc.data}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{doc.responsavel}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{doc.categoria}</TableCell>
                  <TableCell className="text-foreground text-sm">{doc.produto}</TableCell>
                  <TableCell className="font-semibold text-foreground">{doc.quantidade}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 border-0 text-[11px]">
                      Registado
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Documento de Devolução</DialogTitle>
            <DialogDescription>
              Preencha os campos para registar uma devolução de brindes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nome do Documento</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Devolução Web Summit 2025"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Responsável</Label>
                <Input
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Nome"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Pedido Ativo (Produto)</Label>
              <Select value={pedidoId} onValueChange={setPedidoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar pedido" />
                </SelectTrigger>
                <SelectContent>
                  {pedidosAtivos.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.produtoNome} — {p.quantidadeLevantada - p.quantidadeDevolvida} un. por devolver ({p.evento})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Quantidade a Devolver</Label>
              <Input
                type="number"
                min={1}
                max={maxDevolver}
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0"
              />
              {selectedPedido && (
                <p className="text-xs text-muted-foreground">
                  Máximo: {maxDevolver} un. (Levantou {selectedPedido.quantidadeLevantada}, já devolveu {selectedPedido.quantidadeDevolvida})
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!nome || !responsavel || !pedidoId || !quantidade}
            >
              Registar Devolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockDevolucao;
