import { useState, useEffect, useRef, KeyboardEvent } from "react";
import {
  Search, Filter, Users, Building2, Calendar, Link2,
  ChevronDown, X, Plus, Trash2, UserCheck, Briefcase,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ImageUpload from "@/components/ImageUpload";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const defaultTags = [
  "Passaporte Digital de Produto", "Inteligência Artificial", "Capital Natural",
  "OCR", "Cidades Inteligentes", "Sustentabilidade", "Rastreabilidade",
];

const estados: Record<string, { label: string; class: string }> = {
  lancado: { label: "Lançado", class: "bg-green-100 text-green-700" },
  em_desenvolvimento: { label: "Em desenvolvimento", class: "bg-orange-100 text-orange-700" },
  planeado: { label: "Planeado", class: "bg-blue-100 text-blue-700" },
};

export interface Produto {
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
  dataPrevisaoLancamento: string;
  links: { label: string; url: string }[];
  imagemUrl: string;
  logoUrl: string;
  responsavel: string;
  productOwner: string;
  comercialResponsavel: string;
}

const defaultProdutos: Produto[] = [
  {
    id: 1,
    nome: "MyDigiFile",
    resumo: "Processamento automático de faturas com OCR e Inteligência Artificial",
    descricao: "A plataforma MyDigiFile processa as suas faturas de forma automática através de tecnologias de Reconhecimento Óptico de Caracteres (OCR) e Inteligência Artificial (IA), de forma rápida e segura.",
    tags: ["OCR", "Inteligência Artificial"],
    estado: "lancado",
    equipa: [],
    cliente: "",
    parceiros: [],
    dataInicio: "",
    dataFim: "",
    dataPrevisaoLancamento: "",
    links: [{ label: "Saber mais", url: "https://www.mydigifile.ai/pt" }],
    imagemUrl: "/images/mydigifile.png",
    logoUrl: "/images/mydigifile.png",
    responsavel: "Tiago Santos",
    productOwner: "Pedro Moreira",
    comercialResponsavel: "",
  },
  {
    id: 2,
    nome: "DPP – Passaporte Digital do Produto",
    resumo: "Sistema digital normalizado de identidade e rastreabilidade de produtos",
    descricao: "Um sistema digital normalizado que reúne, organiza e disponibiliza informação relevante sobre um produto ao longo de todo o seu ciclo de vida.",
    tags: ["Passaporte Digital de Produto", "Rastreabilidade"],
    estado: "lancado",
    equipa: [],
    cliente: "",
    parceiros: [],
    dataInicio: "",
    dataFim: "",
    dataPrevisaoLancamento: "",
    links: [{ label: "Saber mais", url: "https://www.datacolab.pt/project/dpp-digital-product-passport/" }],
    imagemUrl: "/images/dpp.png",
    logoUrl: "/images/dpp.png",
    responsavel: "",
    productOwner: "",
    comercialResponsavel: "",
  },
  {
    id: 3,
    nome: "CIT – Centro de Inteligência Territorial",
    resumo: "Plataforma de Data as a Service para territórios inteligentes",
    descricao: "Uma plataforma que centraliza serviços de Data as a Service (DaaS), permitindo recolher, integrar, analisar, monitorizar e comunicar dados de várias fontes.",
    tags: ["Cidades Inteligentes"],
    estado: "lancado",
    equipa: [],
    cliente: "",
    parceiros: [],
    dataInicio: "",
    dataFim: "",
    dataPrevisaoLancamento: "",
    links: [{ label: "Saber mais", url: "https://www.inteligenciaterritorial.pt/" }],
    imagemUrl: "/images/cit.png",
    logoUrl: "/images/cit.png",
    responsavel: "",
    productOwner: "",
    comercialResponsavel: "",
  },
  {
    id: 4,
    nome: "NVP",
    resumo: "Medição e compreensão de impactos nos ecossistemas através da tecnologia",
    descricao: "Uma iniciativa resultado da colaboração entre a NBI – Natural Business Intelligence e o Data CoLAB, orientada para revolucionar a forma de medir e compreender impactos nos ecossistemas através da tecnologia.",
    tags: ["Capital Natural", "Sustentabilidade"],
    estado: "lancado",
    equipa: [],
    cliente: "",
    parceiros: ["NBI – Natural Business Intelligence"],
    dataInicio: "",
    dataFim: "",
    dataPrevisaoLancamento: "",
    links: [{ label: "Saber mais", url: "https://www.nvp.pt/" }],
    imagemUrl: "/images/nvp.png",
    logoUrl: "/images/nvp.png",
    responsavel: "",
    productOwner: "",
    comercialResponsavel: "",
  },
];

const NA = "Não aplicável";

/* ───────── Modal de detalhe ───────── */
const ProdutoModal = ({ produto, onClose, onImageChange }: { produto: Produto; onClose: () => void; onImageChange?: (id: number, field: "imagemUrl" | "logoUrl", url: string) => void }) => {
  const est = estados[produto.estado] ?? estados.lancado;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 [&>button.absolute]:hidden">
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
          <div className="flex flex-wrap gap-1.5">
            {produto.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Descrição</p>
            <p className="text-sm text-foreground">{produto.descricao || NA}</p>
          </div>

          {/* Data prevista de lançamento for non-launched */}
          {(produto.estado === "em_desenvolvimento" || produto.estado === "planeado") && produto.dataPrevisaoLancamento && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Data Prevista de Lançamento</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{produto.dataPrevisaoLancamento}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Responsável do Produto</p>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{produto.responsavel || NA}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Product Owner</p>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{produto.productOwner || NA}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Comercial Responsável</p>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{produto.comercialResponsavel || NA}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cliente</p>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{produto.cliente || NA}</span>
              </div>
            </div>
            <div className="col-span-2">
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
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Parceiros</p>
            {produto.parceiros.length > 0
              ? <div className="flex flex-wrap gap-2">{produto.parceiros.map((p) => <Badge key={p} variant="outline">{p}</Badge>)}</div>
              : <p className="text-sm text-muted-foreground">{NA}</p>
            }
          </div>

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

          {onImageChange && (
            <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
              <ImageUpload value={produto.imagemUrl} onChange={(url) => onImageChange(produto.id, "imagemUrl", url)} folder="produtos" label="Imagem do Produto" size="lg" />
              <ImageUpload value={produto.logoUrl} onChange={(url) => onImageChange(produto.id, "logoUrl", url)} folder="produtos/logos" label="Logo" size="sm" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ───────── Formulário de novo produto ───────── */
const emptyForm = (): Omit<Produto, "id"> => ({
  nome: "", resumo: "", descricao: "", tags: [], estado: "lancado",
  equipa: [], cliente: "", parceiros: [], dataInicio: "", dataFim: "",
  dataPrevisaoLancamento: "",
  links: [], imagemUrl: "", logoUrl: "", responsavel: "", productOwner: "",
  comercialResponsavel: "",
});

const NovoProdutoForm = ({
  onSave, onCancel, allTags, onAddTag,
}: {
  onSave: (p: Omit<Produto, "id">) => void;
  onCancel: () => void;
  allTags: string[];
  onAddTag: (tag: string) => void;
}) => {
  const [form, setForm] = useState(emptyForm());
  const [newLink, setNewLink] = useState({ label: "", url: "" });
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const addLink = () => {
    if (!newLink.label || !newLink.url) return;
    set("links", [...form.links, { ...newLink }]);
    setNewLink({ label: "", url: "" });
  };
  const removeLink = (i: number) => set("links", form.links.filter((_, idx) => idx !== i));

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || form.tags.includes(trimmed)) return;
    if (!allTags.includes(trimmed)) onAddTag(trimmed);
    set("tags", [...form.tags, trimmed]);
    setTagInput("");
  };

  const removeTag = (tag: string) => set("tags", form.tags.filter((t) => t !== tag));

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const filteredSuggestions = tagInput.trim()
    ? allTags.filter((t) => t.toLowerCase().includes(tagInput.toLowerCase()) && !form.tags.includes(t))
    : [];

  const handleSubmit = () => {
    if (!form.nome.trim() || !form.resumo.trim()) {
      toast.error("Nome e descrição curta são obrigatórios");
      return;
    }
    onSave(form);
  };

  const showDateField = form.estado === "em_desenvolvimento" || form.estado === "planeado";

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome do Produto *</Label>
              <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Nome do produto" />
            </div>
            <div className="col-span-2">
              <Label>Descrição curta *</Label>
              <Input value={form.resumo} onChange={(e) => set("resumo", e.target.value)} placeholder="Resumo breve" />
            </div>
            <div className="col-span-2">
              <Label>Descrição detalhada</Label>
              <Textarea value={form.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Descrição completa" rows={3} />
            </div>
            <div>
              <ImageUpload value={form.imagemUrl} onChange={(url) => set("imagemUrl", url)} folder="produtos" label="Imagem do Produto" size="lg" />
            </div>
            <div>
              <ImageUpload value={form.logoUrl} onChange={(url) => set("logoUrl", url)} folder="produtos/logos" label="Logo" size="sm" />
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => set("estado", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lancado">Lançado</SelectItem>
                  <SelectItem value="em_desenvolvimento">Em desenvolvimento</SelectItem>
                  <SelectItem value="planeado">Planeado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showDateField && (
              <div>
                <Label>Data prevista de lançamento</Label>
                <Input type="date" value={form.dataPrevisaoLancamento} onChange={(e) => set("dataPrevisaoLancamento", e.target.value)} />
              </div>
            )}
            <div className={showDateField ? "col-span-2" : ""}>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="default" className="text-[10px] gap-1 pr-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="relative">
                <Input
                  ref={tagInputRef}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Escreva e prima Enter para criar tag..."
                  className="text-sm"
                />
                {filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-32 overflow-y-auto">
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                        onClick={() => addTag(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>Cliente (opcional)</Label>
              <Input value={form.cliente} onChange={(e) => set("cliente", e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div>
              <Label>Responsável do Produto</Label>
              <Input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} placeholder="Nome" />
            </div>
            <div>
              <Label>Product Owner</Label>
              <Input value={form.productOwner} onChange={(e) => set("productOwner", e.target.value)} placeholder="Nome" />
            </div>
            <div className="col-span-2">
              <Label>Comercial Responsável</Label>
              <Input value={form.comercialResponsavel} onChange={(e) => set("comercialResponsavel", e.target.value)} placeholder="Nome" />
            </div>
          </div>

          {/* Links dinâmicos */}
          <div>
            <Label>Links (Documentação / Demo / Site)</Label>
            {form.links.length > 0 && (
              <div className="space-y-1.5 mt-2 mb-2">
                {form.links.map((l, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="text-xs">{l.label}</Badge>
                    <span className="text-muted-foreground truncate flex-1">{l.url}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeLink(i)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-1">
              <Input value={newLink.label} onChange={(e) => setNewLink((p) => ({ ...p, label: e.target.value }))} placeholder="Label (ex: Documentação)" className="flex-1" />
              <Input value={newLink.url} onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))} placeholder="URL" className="flex-1" />
              <Button variant="outline" size="sm" onClick={addLink} className="shrink-0 gap-1"><Plus className="w-3 h-3" /> Adicionar</Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button onClick={handleSubmit}>Criar Produto</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ───────── Página principal ───────── */
const Produtos = () => {
  const { user } = useAuth();
  const isAdmin = user?.perfil === "Administrador";
  const [produtos, setProdutos] = useState<Produto[]>(defaultProdutos);
  const [allTags, setAllTags] = useState<string[]>(defaultTags);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Load persisted images from DB
  useEffect(() => {
    const loadImages = async () => {
      const { data } = await supabase.from("produtos_imagens").select("id, imagem_url, logo_url");
      if (data && data.length > 0) {
        setProdutos((prev) =>
          prev.map((p) => {
            const row = data.find((d: any) => d.id === p.id);
            if (!row) return p;
            return {
              ...p,
              ...(row.imagem_url ? { imagemUrl: row.imagem_url } : {}),
              ...(row.logo_url ? { logoUrl: row.logo_url } : {}),
            };
          })
        );
      }
    };
    loadImages();
  }, []);

  const toggleTag = (tag: string) => {
    if (tag === "all") { setSelectedTags([]); return; }
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const filtered = produtos.filter((p) => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || p.resumo.toLowerCase().includes(search.toLowerCase());
    const matchTags = selectedTags.length === 0 || selectedTags.some((t) => p.tags.includes(t));
    return matchSearch && matchTags;
  });

  const handleCreateProduct = (data: Omit<Produto, "id">) => {
    const newProduto: Produto = { ...data, id: Date.now(), imagemUrl: data.imagemUrl || "/placeholder.svg", logoUrl: data.logoUrl || data.imagemUrl || "/placeholder.svg" };
    setProdutos((prev) => [...prev, newProduto]);
    setShowNewForm(false);
    toast.success("Produto criado com sucesso");
  };

  const handleAddTag = (tag: string) => {
    setAllTags((prev) => prev.includes(tag) ? prev : [...prev, tag]);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">Catálogo de produtos e soluções</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowNewForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Produto
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar produtos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Button variant={selectedTags.length === 0 ? "default" : "outline"} size="sm" onClick={() => toggleTag("all")} className="text-xs h-7">Todos</Button>
          {allTags.map((tag) => (
            <Button key={tag} variant={selectedTags.includes(tag) ? "default" : "outline"} size="sm" onClick={() => toggleTag(tag)} className="text-xs h-7">{tag}</Button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => {
          const est = estados[p.estado] ?? estados.lancado;
          const hasCliente = !!p.cliente;
          const hasPO = !!p.productOwner;
          const hasComercial = !!p.comercialResponsavel;

          return (
            <Card key={p.id} className="hover:shadow-lg hover:border-primary/20 transition-all group overflow-hidden flex flex-col">
              <div className="relative h-36 overflow-hidden">
                <img src={p.imagemUrl} alt={p.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <Badge className={`${est.class} border-0 text-[10px] absolute top-3 right-3`}>{est.label}</Badge>
                <img src={p.logoUrl} alt="logo" className="absolute bottom-3 left-3 w-9 h-9 rounded-md border border-white/80 object-cover shadow" />
              </div>

              <CardContent className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1 leading-tight">{p.nome}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.resumo}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {p.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] font-normal">{tag}</Badge>
                  ))}
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3 shrink-0" />
                    <span className="truncate">{p.responsavel || NA}</span>
                  </div>
                  {hasPO && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 shrink-0" />
                      <span className="truncate">{p.productOwner}</span>
                    </div>
                  )}
                  {hasCliente && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{p.cliente}</span>
                    </div>
                  )}
                  {hasComercial && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 shrink-0" />
                      <span className="truncate">{p.comercialResponsavel}</span>
                    </div>
                  )}
                </div>

                <Button variant="outline" size="sm" className="mt-auto w-full text-xs gap-1" onClick={() => setSelectedProduto(p)}>
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
        <ProdutoModal
          produto={selectedProduto}
          onClose={() => setSelectedProduto(null)}
          onImageChange={async (id, field, url) => {
            setProdutos((prev) => prev.map((p) => p.id === id ? { ...p, [field]: url } : p));
            setSelectedProduto((prev) => prev ? { ...prev, [field]: url } : prev);
            const dbField = field === "imagemUrl" ? "imagem_url" : "logo_url";
            const { error } = await supabase.from("produtos_imagens").upsert({ id, [dbField]: url, updated_at: new Date().toISOString() });
            if (error) toast.error("Erro ao guardar imagem");
          }}
        />
      )}
      {showNewForm && <NovoProdutoForm onSave={handleCreateProduct} onCancel={() => setShowNewForm(false)} allTags={allTags} onAddTag={handleAddTag} />}
    </div>
  );
};

export default Produtos;
