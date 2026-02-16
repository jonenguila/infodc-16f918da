import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ERPLayout } from "@/components/ERPLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import NovoPedido from "./pages/NovoPedido";
import Armazem from "./pages/Armazem";
import Permissoes from "./pages/Permissoes";
import ImportExport from "./pages/ImportExport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ERPPage = ({ title }: { title: string }) => (
  <ERPLayout>
    <div className="flex items-center justify-center min-h-screen animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground">Esta página será implementada em breve.</p>
      </div>
    </div>
  </ERPLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/stock/dashboard" element={<ERPLayout><Dashboard /></ERPLayout>} />
          <Route path="/produtos" element={<ERPLayout><Produtos /></ERPLayout>} />
          <Route path="/produtos/categorias" element={<ERPPage title="Categorias de Produtos" />} />
          <Route path="/servicos" element={<ERPPage title="Serviços" />} />
          <Route path="/projetos" element={<ERPPage title="Projetos Financiados" />} />
          <Route path="/stock/novo-pedido" element={<ERPLayout><NovoPedido /></ERPLayout>} />
          <Route path="/stock/categorias" element={<ERPPage title="Categorias de Stock" />} />
          <Route path="/stock/pedidos" element={<ERPPage title="Pedidos de Stock" />} />
          <Route path="/stock/utilizadores" element={<ERPPage title="Utilizadores" />} />
          <Route path="/armazem" element={<ERPLayout><Armazem /></ERPLayout>} />
          <Route path="/armazem/localizacoes" element={<ERPPage title="Localizações" />} />
          <Route path="/admin/permissoes" element={<ERPLayout><Permissoes /></ERPLayout>} />
          <Route path="/import-export" element={<ERPLayout><ImportExport /></ERPLayout>} />
          <Route path="/comunicacao/pedidos" element={<ERPPage title="Pedidos de Comunicação" />} />
          <Route path="/comunicacao/noticias" element={<ERPPage title="Notícias" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
