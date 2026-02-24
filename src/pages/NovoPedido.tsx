import { useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Plus, Trash2, CalendarIcon, Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const armazens = ["SEDE", "Armazém Sul", "Armazém Principal", "Armazém Norte"];
const tiposEvento = ["Conferência", "Workshop", "Feira", "Formação", "Evento Social", "Reunião Institucional", "Outro"];
const prioridades = ["Baixa", "Média", "Alta", "Urgente"];

interface ProdutoDisponivel {
  codigo: string;
  nome: string;
  stock: number;
}

const produtosDisponiveis: ProdutoDisponivel[] = [
  { codigo: "PRD001", nome: "Canetas Esferográficas", stock: 150 },
  { codigo: "PRD002", nome: "Teclado Wireless", stock: 25 },
  { codigo: "PRD003", nome: "T-Shirt Promocional", stock: 8 },
  { codigo: "PRD004", nome: "Papel A4", stock: 75 },
  { codigo: "PRD005", nome: "Monitor 27\"", stock: 5 },
  { codigo: "PRD006", nome: "Quadro Interativo", stock: 2 },
];

interface ProdutoPedido {
  codigo: string;
  nome: string;
  stock: number;
  quantidade: number;
}

const NovoPedido = () => {
  const { toast } = useToast();
  const [dataPedido, setDataPedido] = useState<Date>();
  const [nomeRequisitante, setNomeRequisitante] = useState("");
  const [email, setEmail] = useState("");
  const [armazem, setArmazem] = useState("");
  const [destino, setDestino] = useState("");
  const [descricaoDestino, setDescricaoDestino] = useState("");
  const [tipoEvento, setTipoEvento] = useState("");
  const [dataEvento, setDataEvento] = useState<Date>();
  const [dataRecolha, setDataRecolha] = useState<Date>();
  const [responsavelLevantamento, setResponsavelLevantamento] = useState("");
  const [prioridade, setPrioridade] = useState("Média");
  const [observacoes, setObservacoes] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [produtosPedido, setProdutosPedido] = useState<ProdutoPedido[]>([]);

  const adicionarProduto = () => {
    const prod = produtosDisponiveis.find((p) => p.codigo === produtoSelecionado);
    if (!prod || quantidade < 1) return;
    const existing = produtosPedido.find((pp) => pp.codigo === prod.codigo);
    if (existing) {
      setProdutosPedido((prev) =>
        prev.map((pp) => pp.codigo === prod.codigo ? { ...pp, quantidade: pp.quantidade + quantidade } : pp)
      );
    } else {
      setProdutosPedido((prev) => [...prev, { codigo: prod.codigo, nome: prod.nome, stock: prod.stock, quantidade }]);
    }
    setProdutoSelecionado("");
    setQuantidade(1);
  };

  const removerProduto = (codigo: string) => {
    setProdutosPedido((prev) => prev.filter((pp) => pp.codigo !== codigo));
  };

  const limpar = () => {
    setDataPedido(undefined);
    setNomeRequisitante("");
    setEmail("");
    setArmazem("");
    setDestino("");
    setDescricaoDestino("");
    setTipoEvento("");
    setDataEvento(undefined);
    setDataRecolha(undefined);
    setResponsavelLevantamento("");
    setPrioridade("Média");
    setObservacoes("");
    setProdutoSelecionado("");
    setQuantidade(1);
    setProdutosPedido([]);
  };

  const handleSubmit = () => {
    if (!dataPedido || !nomeRequisitante || produtosPedido.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a data do pedido, nome do requisitante e adicione pelo menos um produto.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Pedido criado com sucesso!",
      description: `Pedido com ${produtosPedido.length} produto(s) registado.`,
    });
    limpar();
  };

  const DateField = ({ label, required, value, onChange }: { label: string; required?: boolean; value: Date | undefined; onChange: (d: Date | undefined) => void }) => (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}>
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
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados gerais */}
          <section className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DateField label="Data do Pedido" required value={dataPedido} onChange={setDataPedido} />
              <div className="space-y-2">
                <Label>Nome do Requisitante <span className="text-destructive">*</span></Label>
                <Input value={nomeRequisitante} onChange={(e) => setNomeRequisitante(e.target.value)} placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label>Origem do Produto</Label>
                <Select value={armazem} onValueChange={setArmazem}>
                  <SelectTrigger><SelectValue placeholder="Selecionar armazém" /></SelectTrigger>
                  <SelectContent>
                    {armazens.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Destino do Produto</Label>
                <Input value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Ex: Departamento de RH" />
              </div>
              <div className="space-y-2">
                <Label>Descrição do Local de Destino</Label>
                <Input value={descricaoDestino} onChange={(e) => setDescricaoDestino(e.target.value)} placeholder="Detalhes sobre o local" />
              </div>
            </div>
          </section>

          {/* Evento e logística */}
          <section className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Evento</Label>
                <Select value={tipoEvento} onValueChange={setTipoEvento}>
                  <SelectTrigger><SelectValue placeholder="Selecionar tipo de evento" /></SelectTrigger>
                  <SelectContent>
                    {tiposEvento.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <DateField label="Data do Evento" value={dataEvento} onChange={setDataEvento} />
              <DateField label="Data Prevista de Recolha" value={dataRecolha} onChange={setDataRecolha} />
              <div className="space-y-2">
                <Label>Responsável pelo Levantamento</Label>
                <Input value={responsavelLevantamento} onChange={(e) => setResponsavelLevantamento(e.target.value)} placeholder="Nome do responsável" />
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={prioridade} onValueChange={setPrioridade}>
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
                    {produtosDisponiveis.map((p) => (
                      <SelectItem key={p.codigo} value={p.codigo}>
                        {p.codigo} - {p.nome} (Stock: {p.stock})
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
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Qtd.</TableHead>
                      <TableHead className="text-right w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtosPedido.map((pp) => (
                      <TableRow key={pp.codigo}>
                        <TableCell className="text-muted-foreground">{pp.codigo}</TableCell>
                        <TableCell className="font-medium text-foreground">{pp.nome}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{pp.stock}</TableCell>
                        <TableCell className="text-right text-foreground font-medium">{pp.quantidade}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removerProduto(pp.codigo)} className="h-8 w-8">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg mt-2">
                Nenhum produto adicionado ao pedido.
              </div>
            )}
          </section>

          {/* Observações */}
          <section className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Observações</h2>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Informações adicionais sobre o pedido..."
            />
          </section>
        </div>

        {/* Coluna lateral – Lembretes */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-8 space-y-5">
            <h2 className="text-base font-semibold text-foreground">Lembretes Importantes:</h2>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2 leading-relaxed">
                <span className="text-primary mt-0.5">•</span>
                Verificar stock com antecedência.
              </li>
              <li className="flex gap-2 leading-relaxed">
                <span className="text-primary mt-0.5">•</span>
                Vigiar os materiais e brindes durante o evento.
              </li>
              <li className="flex gap-2 leading-relaxed">
                <span className="text-primary mt-0.5">•</span>
                Privilegiar oferta a quem segue o Data CoLAB nas redes sociais.
              </li>
              <li className="flex gap-2 leading-relaxed">
                <span className="text-primary mt-0.5">•</span>
                Contabilizar e devolver os brindes após o evento.
              </li>
              <li className="flex gap-2 leading-relaxed">
                <span className="text-primary mt-0.5">•</span>
                Caso existam brindes não utilizados, estes devem ser devolvidos e registados.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={limpar} className="gap-2">
          <X className="w-4 h-4" /> Cancelar
        </Button>
        <Button onClick={handleSubmit} className="gap-2">
          <Send className="w-4 h-4" /> Criar Pedido
        </Button>
      </div>
    </div>
  );
};

export default NovoPedido;
