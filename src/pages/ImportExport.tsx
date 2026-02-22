import { useState } from "react";
import { Upload, Download, FileSpreadsheet, Check, X, ArrowRight, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const colunasSistema = [
  "Nome do Produto", "SKU", "Categoria", "Quantidade", "Preço Unitário",
  "Descrição", "Estado", "Localização", "Fornecedor",
];

const colunasNovoProduto = [
  "Nome do Produto", "Categoria", "Quantidade", "Preço Unitário",
  "Descrição", "Fornecedor",
];

const ImportExport = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("adicionar");

  // Add products state
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addStep, setAddStep] = useState<"upload" | "mapping">("upload");
  const [addColunasExcel, setAddColunasExcel] = useState<string[]>([]);
  const [addMapeamento, setAddMapeamento] = useState<Record<string, string>>({});

  // Import state
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"upload" | "mapping" | "preview">("upload");
  const [colunasExcel, setColunasExcel] = useState<string[]>([]);
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({});
  const [colunasAtivas, setColunasAtivas] = useState<string[]>(colunasSistema);

  // Export state
  const [exportFormat, setExportFormat] = useState("xlsx");
  const [exportColunas, setExportColunas] = useState<string[]>(colunasSistema);

  const handleAddFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAddFile(f);
    setAddColunasExcel(["Product Name", "Type", "Qty", "Unit Price", "Description", "Supplier"]);
    setAddStep("mapping");
  };

  const handleAddProducts = () => {
    toast({ title: "Produtos adicionados", description: `${addFile?.name} importado com sucesso. Novos produtos adicionados ao sistema.` });
    setAddStep("upload");
    setAddFile(null);
    setAddMapeamento({});
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setColunasExcel(["Product Name", "Code", "Category", "Qty", "Price", "Desc", "Status", "Location", "Supplier"]);
    setStep("mapping");
  };

  const toggleColunaAtiva = (col: string) => {
    setColunasAtivas((prev) => prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]);
  };

  const toggleExportColuna = (col: string) => {
    setExportColunas((prev) => prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]);
  };

  const handleImport = () => {
    toast({ title: "Importação concluída", description: `Ficheiro ${file?.name} importado com sucesso.` });
    setStep("upload");
    setFile(null);
  };

  const handleExport = () => {
    toast({ title: "Exportação iniciada", description: `Ficheiro .${exportFormat} a ser gerado com ${exportColunas.length} colunas.` });
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Importar / Exportar</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão de dados em ficheiros Excel</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="adicionar" className="gap-2"><PlusCircle className="w-4 h-4" /> Adicionar Produtos</TabsTrigger>
          <TabsTrigger value="importar" className="gap-2"><Upload className="w-4 h-4" /> Importar</TabsTrigger>
          <TabsTrigger value="exportar" className="gap-2"><Download className="w-4 h-4" /> Exportar</TabsTrigger>
        </TabsList>

        {/* ADD PRODUCTS TAB */}
        <TabsContent value="adicionar">
          {addStep === "upload" && (
            <div className="bg-card rounded-xl border border-border p-8">
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-xl">
                <FileSpreadsheet className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Adicionar novos produtos via Excel</h3>
                <p className="text-sm text-muted-foreground mb-2">Carregue um ficheiro Excel com os novos produtos a adicionar ao sistema.</p>
                <p className="text-xs text-muted-foreground mb-4">Colunas esperadas: Nome do Produto, Categoria, Quantidade, Preço Unitário, Descrição, Fornecedor</p>
                <label>
                  <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleAddFileUpload} className="hidden" />
                  <Button asChild><span>Selecionar Ficheiro</span></Button>
                </label>
              </div>
            </div>
          )}

          {addStep === "mapping" && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Mapear Colunas do Excel</h3>
                    <p className="text-sm text-muted-foreground">Associe as colunas do ficheiro às colunas do sistema para adicionar novos produtos.</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    {addFile?.name}
                  </span>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead>Coluna do Sistema</TableHead>
                      <TableHead className="w-10 text-center"></TableHead>
                      <TableHead>Coluna do Excel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colunasNovoProduto.map((col) => (
                      <TableRow key={col}>
                        <TableCell className="font-medium text-foreground">{col}</TableCell>
                        <TableCell className="text-center"><ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" /></TableCell>
                        <TableCell>
                          <Select value={addMapeamento[col] || ""} onValueChange={(v) => setAddMapeamento({ ...addMapeamento, [col]: v })}>
                            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Selecionar coluna" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ignorar">— Ignorar —</SelectItem>
                              {addColunasExcel.map((ce) => (
                                <SelectItem key={ce} value={ce}>{ce}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setAddStep("upload"); setAddFile(null); }}>Voltar</Button>
                <Button onClick={handleAddProducts} className="gap-2"><Check className="w-4 h-4" /> Adicionar Produtos</Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="importar">
          {step === "upload" && (
            <div className="bg-card rounded-xl border border-border p-8">
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-xl">
                <FileSpreadsheet className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Carregar ficheiro Excel</h3>
                <p className="text-sm text-muted-foreground mb-4">Formatos suportados: .xlsx, .xls, .csv</p>
                <label>
                  <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
                  <Button asChild><span>Selecionar Ficheiro</span></Button>
                </label>
              </div>
            </div>
          )}

          {step === "mapping" && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Definir Colunas</h3>
                    <p className="text-sm text-muted-foreground">Selecione as colunas do sistema a preencher e mapeie com as colunas do Excel.</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    {file?.name}
                  </span>
                </div>

                {/* Select columns to fill */}
                <div className="mb-6">
                  <Label className="mb-3 block">Colunas a preencher:</Label>
                  <div className="flex flex-wrap gap-2">
                    {colunasSistema.map((col) => (
                      <label key={col} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 text-sm cursor-pointer">
                        <Checkbox checked={colunasAtivas.includes(col)} onCheckedChange={() => toggleColunaAtiva(col)} />
                        <span className="text-foreground">{col}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Column mapping */}
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead>Coluna do Sistema</TableHead>
                      <TableHead className="w-10 text-center"></TableHead>
                      <TableHead>Coluna do Excel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colunasAtivas.map((col) => (
                      <TableRow key={col}>
                        <TableCell className="font-medium text-foreground">{col}</TableCell>
                        <TableCell className="text-center"><ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" /></TableCell>
                        <TableCell>
                          <Select value={mapeamento[col] || ""} onValueChange={(v) => setMapeamento({ ...mapeamento, [col]: v })}>
                            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Selecionar coluna" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ignorar">— Ignorar —</SelectItem>
                              {colunasExcel.map((ce) => (
                                <SelectItem key={ce} value={ce}>{ce}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setStep("upload"); setFile(null); }}>Voltar</Button>
                <Button onClick={handleImport} className="gap-2"><Check className="w-4 h-4" /> Importar Dados</Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="exportar">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Configurar Exportação</h3>
              <p className="text-sm text-muted-foreground">Selecione as colunas e o formato do ficheiro.</p>
            </div>

            <div className="grid gap-2 max-w-xs">
              <Label>Formato</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="xls">Excel 97-2003 (.xls)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-3 block">Colunas a exportar:</Label>
              <div className="flex flex-wrap gap-2">
                {colunasSistema.map((col) => (
                  <label key={col} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 text-sm cursor-pointer">
                    <Checkbox checked={exportColunas.includes(col)} onCheckedChange={() => toggleExportColuna(col)} />
                    <span className="text-foreground">{col}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" /> Exportar Ficheiro
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImportExport;
