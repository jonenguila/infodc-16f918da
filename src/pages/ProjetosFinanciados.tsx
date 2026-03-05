import { useState, useEffect } from "react";
import { Plus, Calendar, Users, Building2, Copy, CheckCircle2, X, Download, Link2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Parceiro {
  nome: string;
  tipo: "Líder" | "Parceiro" | "Subcontratado";
}

interface MembroEquipa {
  nome: string;
  funcao: string;
  departamento: string;
  alocacao: number;
}

interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  codigo: string;
  programa: string;
  tipologia: string;
  dataInicio: string;
  dataFim: string;
  responsavel: string;
  investimentoTotal: string;
  linkUtil: string;
  imagemUrl?: string;
  parcerias: Parceiro[];
  equipa: MembroEquipa[];
}

const projetosIniciais: Projeto[] = [
  {
    id: 1,
    titulo: "ViSUS",
    descricao: "O projeto ViSUS pretende impulsionar a transição digital e sustentável da cadeia de valor do setor vitivinícola da Região Demarcada dos Vinhos Verdes. A transformação será concretizada através do desenvolvimento e implementação do Programa de Sustentabilidade da Região dos Vinhos Verdes (PSRVV), suportado por ferramentas digitais inovadoras que aumentam a eficiência operacional, promovem práticas sustentáveis e reforçam a competitividade nos mercados nacionais e internacionais.",
    codigo: "COMPETE2030-FEDER-03126400",
    programa: "COMPETE 2030 – FEDER",
    tipologia: "FEDER",
    dataInicio: "2025-11-03",
    dataFim: "2027-11-02",
    responsavel: "Margarida Cachada",
    investimentoTotal: "302 393,14 €",
    linkUtil: "",
    parcerias: [
      { nome: "Comissão de Viticultura da Região dos Vinhos Verdes (CVRVV)", tipo: "Líder" },
      { nome: "Data CoLAB", tipo: "Parceiro" },
    ],
    equipa: [],
  },
  {
    id: 2,
    titulo: "ToF",
    descricao: "A Test Bed Textile of the Future visa apoiar PME e Startups no desenvolvimento, teste e aceleração de produtos e serviços inovadores para a digitalização e sustentabilidade ambiental da indústria têxtil e vestuário.",
    codigo: "1627",
    programa: "PRR – Plano de Recuperação e Resiliência (Componente 16 – Empresas 4.0)",
    tipologia: "PRR",
    dataInicio: "2023-01-01",
    dataFim: "2025-09-30",
    responsavel: "",
    investimentoTotal: "2 134 661,16 €",
    linkUtil: "",
    parcerias: [
      { nome: "LAMEIRINHO – Indústria Têxtil S.A.", tipo: "Líder" },
      { nome: "Data CoLAB", tipo: "Parceiro" },
    ],
    equipa: [],
  },
  {
    id: 3,
    titulo: "AGROBOTICS-DITWINS",
    descricao: "O projeto visa criar um ecossistema colaborativo para incorporar tecnologias robóticas nas PMEs agrícolas, utilizando gémeos digitais para validar soluções sustentáveis e promover eficiência, circularidade e redução do impacto ambiental.",
    codigo: "S2/1.1/E0173",
    programa: "Interreg Sudoe",
    tipologia: "Interreg",
    dataInicio: "2025-06-01",
    dataFim: "2028-05-31",
    responsavel: "",
    investimentoTotal: "2 325 214,91 €",
    linkUtil: "",
    parcerias: [
      { nome: "Universidade de Málaga", tipo: "Líder" },
      { nome: "Data CoLAB", tipo: "Parceiro" },
    ],
    equipa: [],
  },
  {
    id: 4,
    titulo: "NatVALUE",
    descricao: "Criação de um ecossistema digital para contabilização e valorização do Capital Natural, promovendo gestão ambiental e económica eficiente e facilitando a transição ecológica.",
    codigo: "NORTE2030-FEDER-01193500",
    programa: "NORTE2030 – FEDER",
    tipologia: "FEDER",
    dataInicio: "2026-01-01",
    dataFim: "2028-12-31",
    responsavel: "",
    investimentoTotal: "1 497 939,12 €",
    linkUtil: "",
    parcerias: [
      { nome: "SGS Portugal – Sociedade Geral de Superintendência S.A", tipo: "Líder" },
      { nome: "TINTEX", tipo: "Parceiro" },
      { nome: "IPVC", tipo: "Parceiro" },
      { nome: "NBI", tipo: "Parceiro" },
      { nome: "FEP", tipo: "Parceiro" },
      { nome: "Data CoLAB", tipo: "Parceiro" },
    ],
    equipa: [],
  },
  {
    id: 5,
    titulo: "IMmersive SGS",
    descricao: "Desenvolvimento e certificação de serviços digitais imersivos e ambientes virtuais, promovendo transformação digital, segurança operacional e criação de novos modelos de negócio baseados em RV e gémeos digitais.",
    codigo: "NORTE2030-FEDER-02183900",
    programa: "NORTE2030 – FEDER",
    tipologia: "FEDER",
    dataInicio: "2026-01-01",
    dataFim: "2028-12-31",
    responsavel: "",
    investimentoTotal: "1 153 117,76 €",
    linkUtil: "",
    parcerias: [
      { nome: "SGS Portugal", tipo: "Líder" },
      { nome: "INESC TEC", tipo: "Parceiro" },
      { nome: "Green Dolphin – Factory Fashion", tipo: "Parceiro" },
      { nome: "Data CoLAB", tipo: "Parceiro" },
    ],
    equipa: [],
  },
  {
    id: 6,
    titulo: "PTDataAcademy",
    descricao: "Capacitação de adultos nas regiões Norte, Centro e Alentejo através de formações certificadas nas áreas de dados, programação e transição digital e verde.",
    codigo: "PESSOAS-FSE+-01109900",
    programa: "Pessoas2030 – FSE+",
    tipologia: "FSE+",
    dataInicio: "2025-01-08",
    dataFim: "2028-01-07",
    responsavel: "",
    investimentoTotal: "355 047,50 €",
    linkUtil: "",
    parcerias: [
      { nome: "Data CoLAB", tipo: "Líder" },
    ],
    equipa: [],
  },
  {
    id: 7,
    titulo: "SMART-CARE",
    descricao: "Prova de conceito para transformar gestão hospitalar e investigação clínica através de integração, governação e análise avançada de dados com apoio a decisões estratégicas.",
    codigo: "2024.07425.IACDC/2024",
    programa: "PRR – Plano de Recuperação e Resiliência",
    tipologia: "PRR",
    dataInicio: "2025-04-01",
    dataFim: "2026-01-31",
    responsavel: "",
    investimentoTotal: "46 299,09 €",
    linkUtil: "",
    parcerias: [
      { nome: "Data CoLAB", tipo: "Líder" },
      { nome: "ULS Viseu Dão-Lafões", tipo: "Parceiro" },
    ],
    equipa: [],
  },
  {
    id: 8,
    titulo: "CEADS",
    descricao: "Implementação de um espaço europeu comum de dados agrícolas para partilha segura, interoperável e ética de dados, promovendo inovação e valor económico, ambiental e social.",
    codigo: "GA 101195295",
    programa: "Digital Europe Programme",
    tipologia: "Digital Europe",
    dataInicio: "2025-04-01",
    dataFim: "2028-03-31",
    responsavel: "",
    investimentoTotal: "15 999 920,79 €",
    linkUtil: "",
    parcerias: [
      { nome: "ILVO", tipo: "Líder" },
      { nome: "Consórcio europeu (inclui Data CoLAB)", tipo: "Parceiro" },
    ],
    equipa: [],
  },
  {
    id: 9,
    titulo: "Digi4Circular",
    descricao: "Desenvolvimento de plataforma digital para conceção de produtos circulares baseada em dados e modelos físicos, incluindo Passaporte Digital do Produto para a indústria automóvel.",
    codigo: "101177586",
    programa: "Horizonte Europa",
    tipologia: "Horizonte Europa",
    dataInicio: "2024-11-01",
    dataFim: "2028-04-30",
    responsavel: "",
    investimentoTotal: "5 764 110,50 €",
    linkUtil: "",
    parcerias: [
      { nome: "Paderborn University", tipo: "Líder" },
      { nome: "Consórcio europeu (inclui Data CoLAB)", tipo: "Parceiro" },
    ],
    equipa: [],
  },
  {
    id: 10,
    titulo: "AI-SMAB-PGNP",
    descricao: "Desenvolvimento de sistema de IA para apoiar a gestão estratégica e sustentável dos baldios do Parque Nacional Peneda-Gerês, integrando Big Data, Machine Learning e gémeos digitais.",
    codigo: "2024.07713.IACDC/2024",
    programa: "PRR – Plano de Recuperação e Resiliência",
    tipologia: "PRR",
    dataInicio: "2025-04-01",
    dataFim: "2026-01-31",
    responsavel: "",
    investimentoTotal: "114 270,84 €",
    linkUtil: "",
    parcerias: [
      { nome: "Data CoLAB", tipo: "Líder" },
      { nome: "CiTin", tipo: "Parceiro" },
      { nome: "IPB", tipo: "Parceiro" },
    ],
    equipa: [],
  },
  {
    id: 11,
    titulo: "InovTEES",
    descricao: "Capacitação institucional e dinamização da Plataforma Regional de Especialização Inteligente (PREI TEES), promovendo transformação digital, inovação e competitividade regional.",
    codigo: "NORTE2030-FEDER-02932200",
    programa: "NORTE2030 – FEDER",
    tipologia: "FEDER",
    dataInicio: "2025-10-01",
    dataFim: "2029-09-25",
    responsavel: "",
    investimentoTotal: "469 520,29 €",
    linkUtil: "",
    parcerias: [
      { nome: "INESC TEC", tipo: "Líder" },
      { nome: "CCG/ZGDV", tipo: "Parceiro" },
      { nome: "Data CoLAB", tipo: "Parceiro" },
    ],
    equipa: [],
  },
];

function calcProgress(inicio: string, fim: string): number {
  const now = Date.now();
  const start = new Date(inicio).getTime();
  const end = new Date(fim).getTime();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

const tipoColors: Record<string, string> = {
  "Líder": "bg-blue-100 text-blue-700",
  "Parceiro": "bg-green-100 text-green-700",
  "Subcontratado": "bg-amber-100 text-amber-700",
};

const NA = "Não aplicável";

const ProjetoDetalheModal = ({ projeto, onClose, onImageChange }: { projeto: Projeto; onClose: () => void; onImageChange?: (id: number, url: string) => void }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10">
          <X className="w-4 h-4" />
        </button>
        <DialogHeader>
          <DialogTitle className="text-xl pr-6">{projeto.titulo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Resumo */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Resumo do Projeto</p>
            <p className="text-sm text-foreground">{projeto.descricao || NA}</p>
          </div>

          {/* Equipa */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Equipa / Colaboradores</p>
            {projeto.equipa.length > 0 ? (
              <div className="space-y-2">
                {projeto.equipa.map((m, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{m.nome}</p>
                      <p className="text-xs text-muted-foreground">{m.funcao} · {m.departamento}</p>
                    </div>
                    <Badge variant="outline">{m.alocacao}%</Badge>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">{NA}</p>}
          </div>

          {/* Parcerias */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Parcerias</p>
            {projeto.parcerias.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {projeto.parcerias.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{p.nome}</span>
                    <Badge className={`${tipoColors[p.tipo]} border-0 text-[10px]`}>{p.tipo}</Badge>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">{NA}</p>}
          </div>

          {/* Link útil */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Link Útil</p>
            {projeto.linkUtil ? (
              <Button variant="outline" size="sm" asChild className="gap-2">
                <a href={projeto.linkUtil} target="_blank" rel="noopener noreferrer">
                  <Link2 className="w-3.5 h-3.5" /> Abrir link
                </a>
              </Button>
            ) : <p className="text-sm text-muted-foreground">{NA}</p>}
          </div>

          {/* Download ficha */}
          <div className="pt-2 border-t border-border space-y-2">
            <Button variant="outline" className="gap-2 w-full" disabled>
              <Download className="w-4 h-4" /> Descarregar ficha de projeto
            </Button>
            <p className="text-xs text-muted-foreground text-center">{NA}</p>

            <Button variant="outline" className="gap-2 w-full" asChild>
              <a href="/docs/Visus_Portfolio_Projetos_Financiados.pdf" download="Visus - Portefólio de Projetos Financiados.pdf">
                <Download className="w-4 h-4" /> Visus – Portefólio de Projetos Financiados
              </a>
            </Button>
          </div>

          {onImageChange && (
            <div className="pt-4 border-t border-border">
              <ImageUpload value={projeto.imagemUrl || ""} onChange={(url) => onImageChange(projeto.id, url)} folder="projetos" label="Imagem do Projeto" size="lg" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProjetosFinanciados = () => {
  const [projetos, setProjetos] = useState<Projeto[]>(projetosIniciais);
  const [showNew, setShowNew] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Load persisted images from DB
  useEffect(() => {
    const loadImages = async () => {
      const { data } = await supabase.from("projetos_imagens").select("id, imagem_url");
      if (data && data.length > 0) {
        setProjetos((prev) =>
          prev.map((p) => {
            const row = data.find((d: any) => d.id === p.id);
            return row && row.imagem_url ? { ...p, imagemUrl: row.imagem_url } : p;
          })
        );
      }
    };
    loadImages();
  }, []);

  const [form, setForm] = useState({
    titulo: "", descricao: "", codigo: "", programa: "", tipologia: "",
    dataInicio: "", dataFim: "", responsavel: "", investimentoTotal: "", linkUtil: "", imagemUrl: "",
  });
  const [formParcerias, setFormParcerias] = useState<Parceiro[]>([{ nome: "", tipo: "Parceiro" }]);
  const [formEquipa, setFormEquipa] = useState<MembroEquipa[]>([{ nome: "", funcao: "", departamento: "", alocacao: 100 }]);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = () => {
    const novo: Projeto = {
      id: Date.now(),
      ...form,
      parcerias: formParcerias.filter((p) => p.nome.trim()),
      equipa: formEquipa.filter((m) => m.nome.trim()),
    };
    setProjetos([novo, ...projetos]);
    setShowNew(false);
    setForm({ titulo: "", descricao: "", codigo: "", programa: "", tipologia: "", dataInicio: "", dataFim: "", responsavel: "", investimentoTotal: "", linkUtil: "", imagemUrl: "" });
    setFormParcerias([{ nome: "", tipo: "Parceiro" }]);
    setFormEquipa([{ nome: "", funcao: "", departamento: "", alocacao: 100 }]);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Projetos Financiados</h1>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Projeto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Projeto Financiado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Título *</Label>
                  <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Breve Descrição *</Label>
                  <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Responsável pelo Projeto</Label>
                  <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} placeholder="Nome do responsável" />
                </div>
                <div className="space-y-2">
                  <Label>Investimento Total</Label>
                  <Input value={form.investimentoTotal} onChange={(e) => setForm({ ...form, investimentoTotal: e.target.value })} placeholder="€ 0.000" />
                </div>
                <div className="space-y-2">
                  <Label>Código de Projeto *</Label>
                  <Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="POCI-01-..." />
                </div>
                <div className="space-y-2">
                  <Label>Programa de Financiamento *</Label>
                  <Input value={form.programa} onChange={(e) => setForm({ ...form, programa: e.target.value })} placeholder="Portugal 2020" />
                </div>
                <div className="space-y-2">
                  <Label>Tipologia</Label>
                  <Input value={form.tipologia} onChange={(e) => setForm({ ...form, tipologia: e.target.value })} placeholder="FEDER, Horizonte Europa..." />
                </div>
                <div className="space-y-2">
                  <Label>Link Útil</Label>
                  <Input value={form.linkUtil} onChange={(e) => setForm({ ...form, linkUtil: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Data de Início *</Label>
                  <Input type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Data de Fim *</Label>
                  <Input type="date" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} />
                </div>
              </div>

              {/* Imagem */}
              <ImageUpload value={form.imagemUrl} onChange={(url) => setForm({ ...form, imagemUrl: url })} folder="projetos" label="Imagem do Projeto" size="lg" />

              {/* Parcerias */}
              <div>
                <Label className="mb-2 block">Parcerias</Label>
                {formParcerias.map((p, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input placeholder="Nome da entidade" value={p.nome} onChange={(e) => {
                      const copy = [...formParcerias]; copy[i] = { ...copy[i], nome: e.target.value }; setFormParcerias(copy);
                    }} />
                    <Select value={p.tipo} onValueChange={(v) => {
                      const copy = [...formParcerias]; copy[i] = { ...copy[i], tipo: v as Parceiro["tipo"] }; setFormParcerias(copy);
                    }}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Líder">Líder</SelectItem>
                        <SelectItem value="Parceiro">Parceiro</SelectItem>
                        <SelectItem value="Subcontratado">Subcontratado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setFormParcerias([...formParcerias, { nome: "", tipo: "Parceiro" }])}>
                  + Adicionar parceiro
                </Button>
              </div>

              {/* Equipa */}
              <div>
                <Label className="mb-2 block">Equipa</Label>
                {formEquipa.map((m, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                    <Input placeholder="Nome" value={m.nome} onChange={(e) => {
                      const copy = [...formEquipa]; copy[i] = { ...copy[i], nome: e.target.value }; setFormEquipa(copy);
                    }} />
                    <Input placeholder="Função" value={m.funcao} onChange={(e) => {
                      const copy = [...formEquipa]; copy[i] = { ...copy[i], funcao: e.target.value }; setFormEquipa(copy);
                    }} />
                    <Input placeholder="Departamento" value={m.departamento} onChange={(e) => {
                      const copy = [...formEquipa]; copy[i] = { ...copy[i], departamento: e.target.value }; setFormEquipa(copy);
                    }} />
                    <Input type="number" placeholder="%" value={m.alocacao} onChange={(e) => {
                      const copy = [...formEquipa]; copy[i] = { ...copy[i], alocacao: Number(e.target.value) }; setFormEquipa(copy);
                    }} />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setFormEquipa([...formEquipa, { nome: "", funcao: "", departamento: "", alocacao: 100 }])}>
                  + Adicionar membro
                </Button>
              </div>

              <Button onClick={handleCreate} disabled={!form.titulo || !form.codigo || !form.dataInicio || !form.dataFim} className="w-full">
                Criar Projeto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projetos.map((p) => {
          const progress = calcProgress(p.dataInicio, p.dataFim);
          return (
            <Card key={p.id} className="hover:shadow-lg hover:border-primary/20 transition-all group flex flex-col">
              <CardContent className="p-5 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight flex-1 pr-2">
                    {p.titulo}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{p.tipologia || NA}</Badge>
                </div>

                {/* Responsável */}
                <div className="flex items-center gap-1.5 mb-3">
                  <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">{p.responsavel || NA}</span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 gap-2 mb-4 bg-muted/40 rounded-lg p-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Programa</p>
                    <p className="text-xs font-medium truncate">{p.programa || NA}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Código</p>
                    <div className="flex items-center gap-1.5">
                      <code className="text-[11px] font-mono text-foreground truncate flex-1">{p.codigo}</code>
                      <button
                        onClick={() => handleCopy(p.id, p.codigo)}
                        className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                      >
                        {copiedId === p.id ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Investimento Total</p>
                    <p className="text-xs font-semibold text-primary">{p.investimentoTotal || NA}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-muted-foreground">Progresso</span>
                    <span className="text-[10px] font-semibold">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>

                {/* Dates */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{p.dataInicio || NA} → {p.dataFim || NA}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto w-full text-xs"
                  onClick={() => setSelectedProjeto(p)}
                >
                  Ver mais
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedProjeto && (
        <ProjetoDetalheModal
          projeto={selectedProjeto}
          onClose={() => setSelectedProjeto(null)}
          onImageChange={async (id, url) => {
            setProjetos((prev) => prev.map((p) => p.id === id ? { ...p, imagemUrl: url } : p));
            setSelectedProjeto((prev) => prev ? { ...prev, imagemUrl: url } : prev);
            const { error } = await supabase.from("projetos_imagens").upsert({ id, imagem_url: url, updated_at: new Date().toISOString() });
            if (error) toast.error("Erro ao guardar imagem");
          }}
        />
      )}
    </div>
  );
};

export default ProjetosFinanciados;
