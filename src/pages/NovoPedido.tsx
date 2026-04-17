import { useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Plus, Trash2, CalendarIcon, Send, X, AlertCircle, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useStockStore } from "@/stores/stockStore";
import { supabase } from "@/integrations/supabase/client";

const tiposEvento = ["Conferência", "Workshop", "Feira", "Formação", "Evento Social", "Reunião Institucional", "Outro"];
const prioridades: Array<"Baixa" | "Média" | "Alta" | "Urgente"> = ["Baixa", "Média", "Alta", "Urgente"];

interface ProdutoPedido {
  produtoId: string;
  produtoNome: string;
  stock: number;
  quantidade: number;
}

const NovoPedido = () => {
  const { toast } = useToast();
  const { produtos, criarPedido } = useStockStore();

  const [dataPedido, setDataPedido] = useState<Date>();
  const [nomeRequisitante, setNomeRequisitante] = useState("");
  const [email, setEmail] = useState("");
  const [tipoEvento, setTipoEvento] = useState("");
  const [nomeEvento, setNomeEvento] = useState("");
  const [dataEvento, setDataEvento] = useState<Date>();
  const [dataRecolha, setDataRecolha] = useState<Date>();
  const [responsavelLevantamento, setResponsavelLevantamento] = useState("");
  const [prioridade, setPrioridade] = useState<"Baixa" | "Média" | "Alta" | "Urgente">("Média");
  const [observacoes, setObservacoes] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [produtosPedido, setProdutosPedido] = useState<ProdutoPedido[]>([]);
  const [tentouSubmeter, setTentouSubmeter] = useState(false);

  const produtosComStock = produtos.filter((p) => p.stockAtual > 0);

  const adicionarProduto = () => {
    const prod = produtos.find((p) => String(p.id) === produtoSelecionado);
    if (!prod || quantidade < 1) return;

    const existing = produtosPedido.find((pp) => pp.produtoId === prod.id);
    const totalQtd = (existing?.quantidade || 0) + quantidade;

    if (totalQtd > prod.stockAtual) {
      toast({ title: "Stock insuficiente", description: `"${prod.nome}" tem apenas ${prod.stockAtual} un. disponíveis.`, variant: "destructive" });
      return;
    }

    if (existing) {
      setProdutosPedido((prev) =>
        prev.map((pp) => pp.produtoId === prod.id ? { ...pp, quantidade: pp.quantidade + quantidade } : pp)
      );
    } else {
      setProdutosPedido((prev) => [...prev, { produtoId: prod.id, produtoNome: prod.nome, stock: prod.stockAtual, quantidade }]);
    }
    setProdutoSelecionado("");
    setQuantidade(1);
  };

  const removerProduto = (produtoId: string) => {
    setProdutosPedido((prev) => prev.filter((pp) => pp.produtoId !== produtoId));
  };

  const limpar = () => {
    setDataPedido(undefined); setNomeRequisitante(""); setEmail("");
    setTipoEvento(""); setNomeEvento(""); setDataEvento(undefined);
    setDataRecolha(undefined); setResponsavelLevantamento(""); setPrioridade("Média");
    setObservacoes(""); setProdutoSelecionado(""); setQuantidade(1); setProdutosPedido([]);
    setTentouSubmeter(false);
  };

  const camposValidos = dataPedido && nomeRequisitante && email && tipoEvento && nomeEvento && dataEvento && dataRecolha && responsavelLevantamento && prioridade && produtosPedido.length > 0;

  const handleSubmit = async () => {
    setTentouSubmeter(true);
    if (!camposValidos) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios (*) e adicione pelo menos um produto.", variant: "destructive" });
      return;
    }

    const err = await criarPedido({
      dataPedido: dataPedido!.toISOString(),
      nomeRequisitante,
      email,
      origem: "",
      destino: "",
      descricaoDestino: "",
      tipoEvento,
      nomeEvento,
      dataEvento: dataEvento!.toISOString(),
      dataRecolha: dataRecolha!.toISOString(),
      responsavelLevantamento,
      prioridade,
      observacoes,
      produtos: produtosPedido.map((pp) => ({ produtoId: pp.produtoId, produtoNome: pp.produtoNome, quantidade: pp.quantidade })),
    });

    if (err) {
      toast({ title: "Erro ao criar pedido", description: err, variant: "destructive" });
      return;
    }

    toast({ title: "Pedido criado com sucesso!", description: `Pedido com ${produtosPedido.length} produto(s) registado. Stock atualizado.` });
    limpar();
  };

  const hasError = (condition: boolean) => tentouSubmeter && !condition;

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
    <div className="p-8 animate-fade-in max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Novo Pedido</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Requisitante */}
          <section className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Informações do Requisitante</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DateField label="Data do Pedido" required value={dataPedido} onChange={setDataPedido} />
              <div className="space-y-2">
                <Label>Nome do Requisitante <span className="text-destructive">*</span></Label>
                <Input value={nomeRequisitante} onChange={(e) => setNomeRequisitante(e.target.value)} placeholder="Nome completo" className={cn(hasError(!!nomeRequisitante) && "border-destructive ring-1 ring-destructive")} />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" className={cn(hasError(!!email) && "border-destructive ring-1 ring-destructive")} />
              </div>
            </div>
          </section>

          {/* Detalhes do Evento */}
          <section className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Detalhes do Evento</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Evento <span className="text-destructive">*</span></Label>
                <Select value={tipoEvento} onValueChange={setTipoEvento}>
                  <SelectTrigger className={cn(hasError(!!tipoEvento) && "border-destructive ring-1 ring-destructive")}><SelectValue placeholder="Selecionar tipo de evento" /></SelectTrigger>
                  <SelectContent>
                    {tiposEvento.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome do Evento <span className="text-destructive">*</span></Label>
                <Input value={nomeEvento} onChange={(e) => setNomeEvento(e.target.value)} placeholder="Ex: Web Summit 2025" className={cn(hasError(!!nomeEvento) && "border-destructive ring-1 ring-destructive")} />
              </div>
              <DateField label="Data do Evento" required value={dataEvento} onChange={setDataEvento} />
              <DateField label="Data Prevista de Recolha" required value={dataRecolha} onChange={setDataRecolha} />
              <div className="space-y-2">
                <Label>Responsável pelo Levantamento <span className="text-destructive">*</span></Label>
                <Input value={responsavelLevantamento} onChange={(e) => setResponsavelLevantamento(e.target.value)} placeholder="Nome do responsável" className={cn(hasError(!!responsavelLevantamento) && "border-destructive ring-1 ring-destructive")} />
              </div>
              <div className="space-y-2">
                <Label>Prioridade <span className="text-destructive">*</span></Label>
                <Select value={prioridade} onValueChange={(v) => setPrioridade(v as typeof prioridade)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {prioridades.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Produtos */}
          <section className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Adicionar Produtos</h2>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-2 flex-1 min-w-[220px]">
                <Label>Selecionar produto</Label>
                <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                  <SelectTrigger><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
                  <SelectContent>
                    {produtosComStock.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nome} (Stock: {p.stockAtual})
                      </SelectItem>
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

            {produtosPedido.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden mt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/40">
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Stock Disp.</TableHead>
                      <TableHead className="text-right">Qtd.</TableHead>
                      <TableHead className="text-right w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtosPedido.map((pp) => (
                      <TableRow key={pp.produtoId}>
                        <TableCell className="font-medium text-foreground">{pp.produtoNome}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{pp.stock}</TableCell>
                        <TableCell className={cn("text-right font-medium", pp.quantidade > pp.stock ? "text-destructive" : "text-foreground")}>
                          {pp.quantidade}
                          {pp.quantidade > pp.stock && <AlertCircle className="w-3 h-3 inline ml-1" />}
                        </TableCell>
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
              <div className={cn("text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg mt-2", hasError(produtosPedido.length > 0) ? "border-destructive bg-destructive/5" : "border-border")}>
                Nenhum produto adicionado ao pedido.
              </div>
            )}
          </section>

          {/* Observações */}
          <section className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Observações</h2>
            <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} placeholder="Informações adicionais sobre o pedido..." />
          </section>
        </div>

        {/* Lembretes */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-8 space-y-5">
            <h2 className="text-base font-semibold text-foreground">Lembretes Importantes:</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2 leading-relaxed"><span className="text-primary mt-0.5">•</span>Verificar stock com antecedência.</li>
              <li className="flex gap-2 leading-relaxed"><span className="text-primary mt-0.5">•</span>Vigiar os materiais e brindes durante o evento.</li>
              <li className="flex gap-2 leading-relaxed"><span className="text-primary mt-0.5">•</span>Privilegiar oferta a quem segue o Data CoLAB nas redes sociais.</li>
              <li className="flex gap-2 leading-relaxed"><span className="text-primary mt-0.5">•</span>O levantamento é feito na delegação de Viana do Castelo. Caso não consiga levantar, arranjar um colaborador que levante por si.</li>
              <li className="flex gap-2 leading-relaxed"><span className="text-primary mt-0.5">•</span>Contabilizar e devolver os brindes após o evento. Deve ser preenchido o campo "Devolução" no +InfoDataCoLAB, depois do ato da entrega na delegação de Viana do Castelo ao cuidado do colaborador Jorge Rodrigues.</li>
              <li className="flex gap-2 leading-relaxed"><span className="text-primary mt-0.5">•</span>Caso existam brindes não utilizados, estes devem ser devolvidos e registados.</li>
              <li className="flex gap-2 leading-relaxed">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  Não te esqueças de registar a tua ida ao evento no formulário:{" "}
                  <a
                    href="https://forms.office.com/Pages/ResponsePage.aspx?id=WjgSWLKyyEaD2WOOg1g5qNFSEvuXwzROiN58fyl-yUdUMEw2VVExNFRIUDRFM1RRVEM5SFYxUU1KNS4u"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline inline-flex items-center gap-1 hover:text-primary/80"
                  >
                    Requerimentos de Pedidos de Comunicação <ExternalLink className="w-3 h-3" />
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={limpar} className="gap-2"><X className="w-4 h-4" /> Cancelar</Button>
        <Button onClick={handleSubmit} className="gap-2"><Send className="w-4 h-4" /> Criar Pedido</Button>
      </div>
    </div>
  );
};

export default NovoPedido;
