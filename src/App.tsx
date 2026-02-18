import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ERPLayout } from "@/components/ERPLayout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import NovoPedido from "./pages/NovoPedido";
import Armazem from "./pages/Armazem";
import Permissoes from "./pages/Permissoes";
import ImportExport from "./pages/ImportExport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const ERPPage = ({ title }: { title: string }) => (
  <ProtectedRoute>
    <ERPLayout>
      <div className="flex items-center justify-center min-h-screen animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground">Esta página será implementada em breve.</p>
        </div>
      </div>
    </ERPLayout>
  </ProtectedRoute>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/stock/dashboard" element={<ProtectedRoute><ERPLayout><Dashboard /></ERPLayout></ProtectedRoute>} />
      <Route path="/produtos" element={<ProtectedRoute><ERPLayout><Produtos /></ERPLayout></ProtectedRoute>} />
      <Route path="/produtos/categorias" element={<ERPPage title="Categorias de Produtos" />} />
      <Route path="/servicos" element={<ERPPage title="Serviços" />} />
      <Route path="/projetos" element={<ERPPage title="Projetos Financiados" />} />
      <Route path="/stock/novo-pedido" element={<ProtectedRoute><ERPLayout><NovoPedido /></ERPLayout></ProtectedRoute>} />
      <Route path="/stock/categorias" element={<ERPPage title="Categorias de Stock" />} />
      <Route path="/stock/pedidos" element={<ERPPage title="Pedidos de Stock" />} />
      <Route path="/stock/utilizadores" element={<ERPPage title="Utilizadores" />} />
      <Route path="/armazem" element={<ProtectedRoute><ERPLayout><Armazem /></ERPLayout></ProtectedRoute>} />
      <Route path="/armazem/localizacoes" element={<ERPPage title="Localizações" />} />
      <Route path="/admin/permissoes" element={<ProtectedRoute><ERPLayout><Permissoes /></ERPLayout></ProtectedRoute>} />
      <Route path="/import-export" element={<ProtectedRoute><ERPLayout><ImportExport /></ERPLayout></ProtectedRoute>} />
      <Route path="/comunicacao/pedidos" element={<ERPPage title="Pedidos de Comunicação" />} />
      <Route path="/comunicacao/noticias" element={<ERPPage title="Notícias" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
