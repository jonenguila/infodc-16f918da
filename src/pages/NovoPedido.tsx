import { useState } from "react";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const categoriasProdutos = ["Brindes", "Material Escritório", "Tecnologia", "Têxtil", "Decoração"];
const delegacoes = ["Lisboa", "Porto", "Coimbra", "Faro", "Braga", "Aveiro", "Setúbal"];
const tiposEvento = ["Conferência", "Workshop", "Feira", "Formação", "Evento Social", "Reunião Institucional", "Outro"];

const produtosDisponiveis = [
  { id: 1, nome: "Caneta Personalizada", categoria: "Material Escritório" },
  { id: 2, nome: "T-Shirt Evento", categoria: "Têxtil" },
  { id: 3, nome: "Pendrive 16GB", categoria: "Tecnologia" },
  { id: 4, nome: "Saco de Algodão", categoria: "Têxtil" },
  { id: 5, nome: "Bloco de Notas A5", categoria: "Material Escritório" },
  { id: 6, nome: "Power Bank 5000mAh", categoria: "Tecnologia" },
  { id: 7, nome: "Porta-chaves LED", categoria: "Brindes" },
  { id: 8, nome: "Garrafa Térmica", categoria: "Brindes" },
  { id: 9, nome: "Mouse Pad Custom", categoria: "Tecnologia" },
];

interface ProdutoPedido {
  produtoId: number;
  nome: string;
  categoria: string;
  quantidade: number;
}

const NovoPedido = () => {
  const { toast } = useToast();
  const [nomeRequerente, setNomeRequerente] = useState("");
  const [delegacao, setDelegacao] = useState("");
  const [tipoEvento, setTipoEvento] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [dataRecolha, setDataRecolha] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [produtosPedido, setProdutosPedido] = useState<ProdutoPedido[]>([]);

  const produtosFiltrados = categoriaFiltro === "Todos"
    ? produtosDisponiveis
    : produtosDisponiveis.filter((p) => p.categoria === categoriaFiltro);

  const adicionarProduto = () => {
    const prod = produtosDisponiveis.find((p) => p.id === Number(produtoSelecionado));
    if (!prod) return;
    const existing = produtosPedido.find((pp) => pp.produtoId === prod.id);
    if (existing) {
      setProdutosPedido((prev) =>
        prev.map((pp) => pp.produtoId === prod.id ? { ...pp, quantidade: pp.quantidade + quantidade } : pp)
      );
    } else {
      setProdutosPedido((prev) => [...prev, { produtoId: prod.id, nome: prod.nome, categoria: prod.categoria, quantidade }]);
    }
    setProdutoSelecionado("");
    setQuantidade(1);
  };

  const removerProduto = (produtoId: number) => {
    setProdutosPedido((prev) => prev.filter((pp) => pp.produtoId !== produtoId));
  };

  const handleSubmit = () => {
    if (!nomeRequerente || !delegacao || !tipoEvento || !dataEvento || produtosPedido.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios e adicione pelo menos um produto.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Pedido criado com sucesso!",
      description: `Pedido com ${produtosPedido.length} produto(s) submetido.`,
    });
    // Reset
    setNomeRequerente("");
    setDelegacao("");
    setTipoEvento("");
    setDataEvento("");
    setDataRecolha("");
    setObservacoes("");
    setProdutosPedido([]);
  };

  return (
    <div className="p-8 animate-fade-in max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Novo Pedido</h1>
        <p className="text-sm text-muted-foreground mt-1">Criar um novo pedido de brindes/materiais</p>
      </div>

      <div className="space-y-6">
        {/* Informações do Requerente */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Informações do Requerente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Nome do Requerente *</Label>
              <Input value={nomeRequerente} onChange={(e) => setNomeRequerente(e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="grid gap-2">
              <Label>Delegação *</Label>
              <Select value={delegacao} onValueChange={setDelegacao}>
                <SelectTrigger><SelectValue placeholder="Selecionar delegação" /></SelectTrigger>
                <SelectContent>
                  {delegacoes.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Detalhes do Evento */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Detalhes do Evento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Tipo de Evento *</Label>
              <Select value={tipoEvento} onValueChange={setTipoEvento}>
                <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                <SelectContent>
                  {tiposEvento.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Data do Evento *</Label>
              <Input type="date" value={dataEvento} onChange={(e) => setDataEvento(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Data Prevista de Recolha</Label>
              <Input type="date" value={dataRecolha} onChange={(e) => setDataRecolha(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Adicionar Produtos */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Produtos</h2>
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div className="grid gap-2 min-w-[150px]">
              <Label>Categoria</Label>
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas</SelectItem>
                  {categoriasProdutos.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 flex-1 min-w-[200px]">
              <Label>Produto</Label>
              <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                <SelectTrigger><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
                <SelectContent>
                  {produtosFiltrados.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 w-[100px]">
              <Label>Quantidade</Label>
              <Input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
            </div>
            <Button onClick={adicionarProduto} disabled={!produtoSelecionado} className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>

          {produtosPedido.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosPedido.map((pp) => (
                  <TableRow key={pp.produtoId}>
                    <TableCell className="font-medium text-foreground">{pp.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{pp.categoria}</TableCell>
                    <TableCell className="text-right text-foreground">{pp.quantidade}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => removerProduto(pp.produtoId)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {produtosPedido.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum produto adicionado ao pedido.</p>
          )}
        </div>

        {/* Observações */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Observações</h2>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={4}
            placeholder="Adicione observações relevantes ao pedido..."
          />
          <p className="text-xs text-muted-foreground mt-4 p-3 bg-secondary/50 rounded-lg">
            Nota: Os brindes solicitados estão sujeitos à disponibilidade em stock. A equipa de gestão irá analisar o pedido e confirmar a disponibilidade dos materiais solicitados. Após aprovação, será enviada uma notificação com a confirmação e os detalhes de recolha.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancelar</Button>
          <Button onClick={handleSubmit}>Submeter Pedido</Button>
        </div>
      </div>
    </div>
  );
};

export default NovoPedido;
