import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { canAccessRoute } from "@/lib/permissions";
import { ERPLayout } from "@/components/ERPLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Servicos from "./pages/Servicos";
import ProjetosFinanciados from "./pages/ProjetosFinanciados";
import StockBrindes from "./pages/StockBrindes";
import StockDevolucao from "./pages/StockDevolucao";
import Permissoes from "./pages/Permissoes";
import GestaoUtilizadores from "./pages/GestaoUtilizadores";
import Comunicacao from "./pages/Comunicacao";
import Newsletter from "./pages/Newsletter";
import OutrosLinks from "./pages/OutrosLinks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !canAccessRoute(user.perfil, location.pathname)) {
    return (
      <ERPLayout>
        <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h1>
            <p className="text-muted-foreground">Não tem permissão para aceder a esta página.</p>
          </div>
        </div>
      </ERPLayout>
    );
  }
  return <>{children}</>;
};

const P = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute><ERPLayout>{children}</ERPLayout></ProtectedRoute>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<P><Dashboard /></P>} />
      <Route path="/produtos" element={<P><Produtos /></P>} />
      <Route path="/servicos" element={<P><Servicos /></P>} />
      <Route path="/projetos" element={<P><ProjetosFinanciados /></P>} />
      <Route path="/stock" element={<P><StockBrindes /></P>} />
      <Route path="/stock/produtos" element={<P><StockBrindes defaultTab="stock" /></P>} />
      <Route path="/stock/pedidos" element={<P><StockBrindes defaultTab="pedidos" /></P>} />
      <Route path="/stock/devolucao" element={<P><StockDevolucao /></P>} />
      <Route path="/stock/historico" element={<P><StockBrindes defaultTab="historico" /></P>} />
      <Route path="/comunicacao/pedidos" element={<P><Comunicacao /></P>} />
      <Route path="/comunicacao/newsletter" element={<P><Newsletter /></P>} />
      <Route path="/comunicacao/links" element={<P><OutrosLinks /></P>} />
      <Route path="/admin/permissoes" element={<P><Permissoes /></P>} />
      <Route path="/admin/utilizadores" element={<P><GestaoUtilizadores /></P>} />
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
