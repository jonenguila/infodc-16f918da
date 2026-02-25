import { useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { type ProdutoDevolucaoDoc } from "@/stores/stockStore";
import {
  RotateCcw, FileText, Search, Plus, Trash2, CalendarIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useStockStore } from "@/stores/stockStore";
import { cn } from "@/lib/utils";

const StockDevolucao = () => {
  const { produtos, documentosDevolucao, registarDocumentoDevolucao } = useStockStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [nome, setNome] = useState("");
  const [nomeEvento, setNomeEvento] = useState("");
  const [dataEntrega, setDataEntrega] = useState<Date>();
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [produtosDevolucao, setProdutosDevolucao] = useState<ProdutoDevolucaoDoc[]>([]);
  const [tentouSubmeter, setTentouSubmeter] = useState(false);

  const camposValidos = nome && nomeEvento && dataEntrega && responsavel && produtosDevolucao.length > 0;

  const hasError = (condition: boolean) => tentouSubmeter && !condition;

  const adicionarProduto = () => {
    const prod = produtos.find((p) => String(p.id) === produtoSelecionado);
    if (!prod || quantidade < 1) return;
    const existing = produtosDevolucao.find((pp) => pp.produtoId === prod.id);
    if (existing) {
      setProdutosDevolucao((prev) =>
        prev.map((pp) => pp.produtoId === prod.id ? { ...pp, quantidade: pp.quantidade + quantidade } : pp)
      );
    } else {
      setProdutosDevolucao((prev) => [...prev, { produtoId: prod.id, produtoNome: prod.nome, quantidade }]);
    }
    setProdutoSelecionado("");
    setQuantidade(1);
  };

  const removerProduto = (produtoId: number) => {
    setProdutosDevolucao((prev) => prev.filter((pp) => pp.produtoId !== produtoId));
  };

  const limparForm = () => {
    setNome(""); setNomeEvento(""); setDataEntrega(undefined);
    setResponsavel(""); setObservacoes("");
    setProdutoSelecionado(""); setQuantidade(1); setProdutosDevolucao([]);
    setTentouSubmeter(false);
  };

  const handleSubmit = () => {
    setTentouSubmeter(true);
    if (!camposValidos) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios (*) e adicione pelo menos um produto.", variant: "destructive" });
      return;
    }
    registarDocumentoDevolucao({
      nome,
      nomeEvento,
      dataEntrega: dataEntrega!.toISOString().slice(0, 10),
      responsavel,
      produtos: [...produtosDevolucao],
      observacoes,
    });
    toast({ title: "Devolução registada", description: `Documento "${nome}" criado com ${produtosDevolucao.length} produto(s).` });
    setDialogOpen(false);
    limparForm();
  };

  const totalUnidades = documentosDevolucao.reduce((s, d) => s + d.produtos.reduce((a, p) => a + p.quantidade, 0), 0);

  const filteredDocs = documentosDevolucao.filter(
    (d) =>
      d.nome.toLowerCase().includes(search.toLowerCase()) ||
      d.nomeEvento.toLowerCase().includes(search.toLowerCase()) ||
      d.responsavel.toLowerCase().includes(search.toLowerCase())
  );

  const DateField = ({ label, required, value, onChange }: { label: string; required?: boolean; value: Date | undefined; onChange: (d: Date | undefined) => void }) => (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", required && hasError(!!value) && "border-destructive ring-1 ring-destructive")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "d 'de' MMMM, yyyy", { locale: pt }) : "Selecionar data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="p-8 animate-fade-in bg-background min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-primary" />
          Devoluções
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Documentos de devolução de brindes</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Card><CardContent className="p-4 text-center">
          <FileText className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-foreground">{documentosDevolucao.length}</p>
          <p className="text-[11px] text-muted-foreground">Total Documentos</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <RotateCcw className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-foreground">{totalUnidades}</p>
          <p className="text-[11px] text-muted-foreground">Unidades Devolvidas</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <FileText className="w-5 h-5 mx-auto mb-1 text-amber-600" />
          <p className="text-2xl font-bold text-foreground">{produtos.length}</p>
          <p className="text-[11px] text-muted-foreground">Produtos Disponíveis</p>
        </CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar documento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => { limparForm(); setDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Documento de Devolução
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead>Nome</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Data Entrega</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Total Un.</TableHead>
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
            ) : filteredDocs.map((doc) => (
              <TableRow key={doc.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                    </div>
                    {doc.nome}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{doc.nomeEvento}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{doc.dataEntrega}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{doc.responsavel}</TableCell>
                <TableCell className="text-foreground text-sm">{doc.produtos.map((p) => p.produtoNome).join(", ")}</TableCell>
                <TableCell className="font-semibold text-foreground">{doc.produtos.reduce((a, p) => a + p.quantidade, 0)}</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-700 border-0 text-[11px]">Registado</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Devolução */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Documento de Devolução</DialogTitle>
            <DialogDescription>Preencha os campos para registar uma devolução de brindes.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Secção 1 – Informações Gerais */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Informações Gerais</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Documento <span className="text-destructive">*</span></Label>
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Devolução Evento X 2026" className={cn(hasError(!!nome) && "border-destructive ring-1 ring-destructive")} />
                </div>
                <div className="space-y-2">
                  <Label>Nome do Evento <span className="text-destructive">*</span></Label>
                  <Input value={nomeEvento} onChange={(e) => setNomeEvento(e.target.value)} placeholder="Ex: Web Summit 2025" className={cn(hasError(!!nomeEvento) && "border-destructive ring-1 ring-destructive")} />
                </div>
                <DateField label="Data de Entrega" required value={dataEntrega} onChange={setDataEntrega} />
                <div className="space-y-2">
                  <Label>Responsável pela Entrega <span className="text-destructive">*</span></Label>
                  <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Nome do responsável" className={cn(hasError(!!responsavel) && "border-destructive ring-1 ring-destructive")} />
                </div>
              </div>
            </section>

            {/* Secção 2 – Produtos Devolvidos */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Produtos Devolvidos</h3>
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2 flex-1 min-w-[180px]">
                  <Label>Selecionar produto</Label>
                  <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                    <SelectTrigger><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
                    <SelectContent>
                      {produtos.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-[100px]">
                  <Label>Qtd.</Label>
                  <Input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))} />
                </div>
                <Button onClick={adicionarProduto} disabled={!produtoSelecionado} className="gap-2">
                  <Plus className="w-4 h-4" /> Adicionar
                </Button>
              </div>

              {produtosDevolucao.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/40">
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right w-[60px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produtosDevolucao.map((pp) => (
                        <TableRow key={pp.produtoId}>
                          <TableCell className="font-medium text-foreground">{pp.produtoNome}</TableCell>
                          <TableCell className="text-right font-medium text-foreground">{pp.quantidade}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => removerProduto(pp.produtoId)} className="h-8 w-8">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className={cn("text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg mt-2", hasError(produtosDevolucao.length > 0) ? "border-destructive bg-destructive/5" : "border-border")}>
                  Nenhum produto adicionado à devolução.
                </div>
              )}
            </section>

            {/* Secção 3 – Observações */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Observações</h3>
              <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} placeholder="Inserir notas adicionais sobre a devolução (opcional)." />
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Registar Devolução</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockDevolucao;
