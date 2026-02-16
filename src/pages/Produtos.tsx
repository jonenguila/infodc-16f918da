import { useState } from "react";
import { Search, Filter, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: number;
  nome: string;
  categoria: string;
  sku: string;
  stock: number;
  preco: string;
  estado: "Ativo" | "Inativo" | "Esgotado";
}

const categorias = ["Todos", "Brindes", "Material Escritório", "Tecnologia", "Têxtil", "Decoração"];

const mockProducts: Product[] = [
  { id: 1, nome: "Caneta Personalizada", categoria: "Material Escritório", sku: "PEN-001", stock: 500, preco: "€1.20", estado: "Ativo" },
  { id: 2, nome: "T-Shirt Evento", categoria: "Têxtil", sku: "TSH-012", stock: 200, preco: "€8.50", estado: "Ativo" },
  { id: 3, nome: "Pendrive 16GB", categoria: "Tecnologia", sku: "USB-003", stock: 0, preco: "€5.90", estado: "Esgotado" },
  { id: 4, nome: "Saco de Algodão", categoria: "Têxtil", sku: "BAG-007", stock: 150, preco: "€3.40", estado: "Ativo" },
  { id: 5, nome: "Bloco de Notas A5", categoria: "Material Escritório", sku: "BLK-020", stock: 320, preco: "€2.10", estado: "Ativo" },
  { id: 6, nome: "Power Bank 5000mAh", categoria: "Tecnologia", sku: "PWB-005", stock: 45, preco: "€12.00", estado: "Ativo" },
  { id: 7, nome: "Porta-chaves LED", categoria: "Brindes", sku: "KEY-011", stock: 0, preco: "€1.80", estado: "Esgotado" },
  { id: 8, nome: "Garrafa Térmica", categoria: "Brindes", sku: "BTL-009", stock: 80, preco: "€7.50", estado: "Ativo" },
  { id: 9, nome: "Moldura Decorativa", categoria: "Decoração", sku: "FRM-015", stock: 25, preco: "€4.20", estado: "Inativo" },
  { id: 10, nome: "Mouse Pad Custom", categoria: "Tecnologia", sku: "MPD-002", stock: 180, preco: "€3.00", estado: "Ativo" },
];

const Produtos = () => {
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    sku: "",
    stock: 0,
    preco: "",
    estado: "Ativo" as Product["estado"],
    descricao: "",
  });

  const filtered = products.filter((p) => {
    const matchSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoriaFilter === "Todos" || p.categoria === categoriaFilter;
    const matchEstado = estadoFilter === "Todos" || p.estado === estadoFilter;
    return matchSearch && matchCat && matchEstado;
  });

  const openNew = () => {
    setEditProduct(null);
    setFormData({ nome: "", categoria: "", sku: "", stock: 0, preco: "", estado: "Ativo", descricao: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setFormData({ nome: p.nome, categoria: p.categoria, sku: p.sku, stock: p.stock, preco: p.preco, estado: p.estado, descricao: "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editProduct) {
      setProducts((prev) => prev.map((p) => p.id === editProduct.id ? { ...p, ...formData } : p));
    } else {
      const newId = Math.max(...products.map((p) => p.id)) + 1;
      setProducts((prev) => [...prev, { id: newId, ...formData }]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerir catálogo de produtos</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome ou SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
            <SelectItem value="Esgotado">Esgotado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Nome</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-foreground">{p.nome}</TableCell>
                <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                <TableCell className="text-muted-foreground">{p.categoria}</TableCell>
                <TableCell className="text-right text-foreground">{p.stock}</TableCell>
                <TableCell className="text-right text-foreground">{p.preco}</TableCell>
                <TableCell>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.estado === "Ativo"
                        ? "bg-success/15 text-success"
                        : p.estado === "Esgotado"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.estado}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        A mostrar {filtered.length} de {products.length} produtos
      </p>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>
              {editProduct ? "Atualize as informações do produto." : "Preencha os dados do novo produto."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>SKU</Label>
                <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {categorias.filter((c) => c !== "Todos").map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Stock</Label>
                <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label>Preço</Label>
                <Input value={formData.preco} onChange={(e) => setFormData({ ...formData, preco: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select value={formData.estado} onValueChange={(v) => setFormData({ ...formData, estado: v as Product["estado"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Esgotado">Esgotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editProduct ? "Guardar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Produtos;
