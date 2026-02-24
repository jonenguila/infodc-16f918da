import { useState } from "react";
import { Search, Filter, Users, Building2, Calendar, Link2, ChevronDown, ChevronUp, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const tags = ["Passaporte Digital de Produto", "Inteligência Artificial", "Capital Natural", "OCR", "Cidades Inteligentes", "Sustentabilidade", "Rastreabilidade"];

const estados: Record<string, { label: string; class: string }> = {
  em_desenvolvimento: { label: "Em Desenvolvimento", class: "bg-blue-100 text-blue-700" },
  concluido: { label: "Concluído", class: "bg-green-100 text-green-700" },
  planeado: { label: "Planeado", class: "bg-amber-100 text-amber-700" },
  em_pausa: { label: "Em Pausa", class: "bg-gray-100 text-gray-600" },
};

interface Produto {
  id: number;
  nome: string;
  resumo: string;
  descricao: string;
  tags: string[];
  estado: string;
  equipa: string[];
  cliente: string;
  parceiros: string[];
  dataInicio: string;
  dataFim: string;
  links: { label: string; url: string }[];
  imagemUrl: string;
  logoUrl: string;
}

const produtos: Produto[] = [
  {
    id: 1,
    nome: "Plataforma Analytics Pro",
    resumo: "Dashboard avançado de análise de dados em tempo real",
    descricao: "Solução completa de Business Intelligence que transforma dados brutos em insights estratégicos. Inclui dashboards interativos, alertas automatizados e integração com múltiplas fontes de dados.",
    tags: ["Inteligência Artificial", "Capital Natural"],
    estado: "em_desenvolvimento",
    equipa: ["Ana Silva", "João Costa"],
    cliente: "Tech Solutions Lda",
    parceiros: ["DataViz Corp", "CloudBase"],
    dataInicio: "2024-03-01",
    dataFim: "2025-06-30",
    links: [{ label: "Documentação", url: "#" }, { label: "Demo", url: "#" }],
    imagemUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&q=80",
  },
  {
    id: 2,
    nome: "Smart Factory Monitor",
    resumo: "Sistema de monitorização industrial com sensores IoT",
    descricao: "Plataforma de monitorização em tempo real para linhas de produção industrial. Integra sensores IoT, análise preditiva de falhas e dashboards operacionais para maximizar a eficiência.",
    tags: ["Cidades Inteligentes", "OCR"],
    estado: "concluido",
    equipa: ["Pedro Martins", "Sara Lopes"],
    cliente: "IndustrialCorp",
    parceiros: ["SensorTech"],
    dataInicio: "2023-06-01",
    dataFim: "2024-12-31",
    links: [{ label: "Relatório Final", url: "#" }],
    imagemUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=100&q=80",
  },
  {
    id: 3,
    nome: "ESG Compliance Tracker",
    resumo: "Plataforma de tracking e reporting de métricas ESG",
    descricao: "Ferramenta de gestão e reporte de indicadores ambientais, sociais e de governança (ESG). Automatiza a recolha de dados e gera relatórios conformes com as normativas europeias.",
    tags: ["Sustentabilidade", "Capital Natural"],
    estado: "planeado",
    equipa: ["Maria Santos"],
    cliente: "Green Energy SA",
    parceiros: [],
    dataInicio: "2025-01-15",
    dataFim: "2026-03-30",
    links: [],
    imagemUrl: "https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=100&q=80",
  },
  {
    id: 4,
    nome: "DataFlow Engine",
    resumo: "Motor de ETL e integração de dados multi-source",
    descricao: "Pipeline de dados de alta performance para extração, transformação e carregamento (ETL) de múltiplas fontes heterogéneas. Suporta streaming em tempo real e processamento em lote.",
    tags: ["Passaporte Digital de Produto", "Inteligência Artificial"],
    estado: "em_desenvolvimento",
    equipa: ["Rui Ferreira", "Ana Silva"],
    cliente: "Banco Nacional",
    parceiros: ["CloudBase", "DataSync"],
    dataInicio: "2024-09-01",
    dataFim: "2025-12-31",
    links: [{ label: "API Docs", url: "#" }],
    imagemUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1541560052-5e137f229371?w=100&q=80",
  },
  {
    id: 5,
    nome: "Chain Verify",
    resumo: "Sistema de rastreabilidade e autenticidade na cadeia de valor",
    descricao: "Solução blockchain para garantir a rastreabilidade e autenticidade de produtos ao longo de toda a cadeia de abastecimento. Utiliza contratos inteligentes para validação automática.",
    tags: ["Rastreabilidade", "Sustentabilidade"],
    estado: "em_pausa",
    equipa: ["João Costa"],
    cliente: "FoodTrace SA",
    parceiros: [],
    dataInicio: "2024-01-01",
    dataFim: "2025-06-30",
    links: [],
    imagemUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&q=80",
  },
  {
    id: 6,
    nome: "Edge AI Gateway",
    resumo: "Gateway inteligente para processamento edge com IA",
    descricao: "Gateway de computação edge com modelos de IA embebidos para processamento local de dados de sensores. Reduz latência e dependência de conectividade cloud em ambientes industriais.",
    tags: ["Inteligência Artificial", "OCR", "Cidades Inteligentes"],
    estado: "em_desenvolvimento",
    equipa: ["Pedro Martins", "Sara Lopes", "Rui Ferreira"],
    cliente: "Telecom Plus",
    parceiros: ["EdgeSystems"],
    dataInicio: "2024-11-01",
    dataFim: "2026-05-31",
    links: [{ label: "Especificações", url: "#" }],
    imagemUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=100&q=80",
  },
];

const NA = "Não aplicável";

const ProdutoModal = ({ produto, onClose }: { produto: Produto; onClose: () => void }) => {
  const est = estados[produto.estado];
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
        {/* Banner */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <img src={produto.imagemUrl} alt={produto.nome} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-end gap-3">
            <img src={produto.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg border-2 border-white object-cover shadow-lg" />
            <div>
              <h2 className="text-white font-bold text-xl leading-tight">{produto.nome}</h2>
              <Badge className={`${est.class} border-0 text-xs mt-1`}>{est.label}</Badge>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {produto.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
          </div>

          {/* Descrição */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Descrição</p>
            <p className="text-sm text-foreground">{produto.descricao || NA}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Equipa */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Equipa</p>
              {produto.equipa.length > 0
                ? produto.equipa.map((m) => (
                  <div key={m} className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Users className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{m}</span>
                  </div>
                ))
                : <p className="text-sm text-muted-foreground">{NA}</p>
              }
            </div>

            {/* Cliente */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cliente</p>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{produto.cliente || NA}</span>
              </div>
            </div>

            {/* Datas */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Data de Início</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{produto.dataInicio || NA}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Data de Fim</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{produto.dataFim || NA}</span>
              </div>
            </div>
          </div>

          {/* Parceiros */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Parceiros / Entidades Beneficiárias</p>
            {produto.parceiros.length > 0
              ? <div className="flex flex-wrap gap-2">{produto.parceiros.map((p) => <Badge key={p} variant="outline">{p}</Badge>)}</div>
              : <p className="text-sm text-muted-foreground">{NA}</p>
            }
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Links Úteis</p>
            {produto.links.length > 0
              ? <div className="flex flex-wrap gap-2">
                {produto.links.map((l) => (
                  <Button key={l.label} variant="outline" size="sm" asChild className="gap-2">
                    <a href={l.url} target="_blank" rel="noopener noreferrer">
                      <Link2 className="w-3.5 h-3.5" />{l.label}
                    </a>
                  </Button>
                ))}
              </div>
              : <p className="text-sm text-muted-foreground">{NA}</p>
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Produtos = () => {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  const toggleTag = (tag: string) => {
    if (tag === "all") { setSelectedTags([]); return; }
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const filtered = produtos.filter((p) => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || p.resumo.toLowerCase().includes(search.toLowerCase());
    const matchTags = selectedTags.length === 0 || selectedTags.some((t) => p.tags.includes(t));
    return matchSearch && matchTags;
  });

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
        <p className="text-sm text-muted-foreground mt-1">Catálogo de produtos e soluções</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Button
            variant={selectedTags.length === 0 ? "default" : "outline"}
            size="sm"
            onClick={() => toggleTag("all")}
            className="text-xs h-7"
          >
            Todos
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag)}
              className="text-xs h-7"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => {
          const est = estados[p.estado];
          return (
            <Card key={p.id} className="hover:shadow-lg hover:border-primary/20 transition-all group overflow-hidden flex flex-col">
              {/* Banner image */}
              <div className="relative h-36 overflow-hidden">
                <img src={p.imagemUrl} alt={p.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <Badge className={`${est.class} border-0 text-[10px] absolute top-3 right-3`}>{est.label}</Badge>
                {/* Logo */}
                <img src={p.logoUrl} alt="logo" className="absolute bottom-3 left-3 w-9 h-9 rounded-md border border-white/80 object-cover shadow" />
              </div>

              <CardContent className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1 leading-tight">
                  {p.nome}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.resumo}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {p.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] font-normal">{tag}</Badge>
                  ))}
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 shrink-0" />
                    <span className="truncate">{p.equipa.join(", ") || "Não aplicável"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{p.cliente || "Não aplicável"}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto w-full text-xs gap-1"
                  onClick={() => setSelectedProduto(p)}
                >
                  Ver mais <ChevronDown className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>Nenhum produto encontrado com os filtros selecionados.</p>
        </div>
      )}

      {selectedProduto && (
        <ProdutoModal produto={selectedProduto} onClose={() => setSelectedProduto(null)} />
      )}
    </div>
  );
};

export default Produtos;
