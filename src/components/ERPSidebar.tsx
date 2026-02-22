import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Package, Wrench, FolderKanban, Box, PlusCircle,
  ClipboardList, Users, Download, Megaphone, Newspaper,
  ChevronDown, ChevronRight, Info, ShieldCheck,
  FileSpreadsheet, LogOut, LayoutDashboard, Menu, X,
  Warehouse, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { canSeeSidebarGroup } from "@/lib/permissions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; icon: React.ElementType; path: string }[];
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Produtos", icon: Package, path: "/produtos" },
  { label: "Serviços", icon: Wrench, path: "/servicos" },
  { label: "Projetos Financiados", icon: FolderKanban, path: "/projetos" },
  {
    label: "Stock",
    icon: Box,
    children: [
      { label: "Novo Pedido", icon: PlusCircle, path: "/stock/novo-pedido" },
      { label: "Delegações", icon: Users, path: "/stock/delegacoes" },
      { label: "Armazém", icon: Warehouse, path: "/stock/armazem" },
      { label: "Importar/Exportar", icon: Upload, path: "/stock/importar-exportar" },
      { label: "Exportar Stock", icon: Download, path: "/stock/exportar" },
    ],
  },
  {
    label: "Comunicação",
    icon: Megaphone,
    children: [
      { label: "Novos Pedidos", icon: ClipboardList, path: "/comunicacao/pedidos" },
      { label: "Newsletter", icon: Newspaper, path: "/comunicacao/newsletter" },
      { label: "Outros Links", icon: FileSpreadsheet, path: "/comunicacao/links" },
    ],
  },
  {
    label: "Administração",
    icon: ShieldCheck,
    children: [
      { label: "Permissões", icon: ShieldCheck, path: "/admin/permissoes" },
      { label: "Utilizadores", icon: Users, path: "/admin/utilizadores" },
    ],
  },
];

interface ERPSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function ERPSidebar({ collapsed, onToggle }: ERPSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>(["Stock"]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (item: MenuItem) =>
    item.children?.some((c) => location.pathname.startsWith(c.path)) ?? false;

  return (
    <aside
      className={cn(
        "flex flex-col min-h-screen bg-sidebar border-r border-sidebar-border shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center border-b border-sidebar-border shrink-0 h-[68px] px-3">
        {!collapsed && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 shrink-0">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">+ INFO</span>
              <p className="text-xs text-sidebar-muted whitespace-nowrap">Data CoLAB</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 mx-auto">
            <Info className="w-4 h-4 text-primary" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md text-sidebar-muted hover:text-foreground hover:bg-sidebar-hover transition-colors shrink-0",
            collapsed ? "absolute top-4 right-2" : "ml-auto"
          )}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted whitespace-nowrap">
            Menu Principal
          </p>
        )}

        <ul className="space-y-0.5">
          {menuItems
            .filter((item) => (user ? canSeeSidebarGroup(user.perfil, item.label) : false))
            .map((item) => {
              if (item.path && !item.children) {
                return (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        collapsed ? "justify-center px-0" : "",
                        isActive(item.path)
                          ? "bg-sidebar-active/15 text-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-[18px] h-[18px] shrink-0" />
                      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </Link>
                  </li>
                );
              }

              const groupOpen = openGroups.includes(item.label) && !collapsed;
              const groupActive = isGroupActive(item);

              return (
                <li key={item.label}>
                  <button
                    onClick={() => {
                      if (collapsed) return;
                      toggleGroup(item.label);
                    }}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      collapsed ? "justify-center px-0" : "",
                      groupActive
                        ? "bg-sidebar-active/15 text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                        {groupOpen ? (
                          <ChevronDown className="w-4 h-4 text-sidebar-muted" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-sidebar-muted" />
                        )}
                      </>
                    )}
                  </button>

                  {groupOpen && item.children && (
                    <ul className="mt-0.5 ml-4 pl-4 border-l border-sidebar-border space-y-0.5 animate-fade-in">
                      {item.children.map((child) => (
                        <li key={child.path + child.label}>
                          <Link
                            to={child.path}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                              isActive(child.path)
                                ? "bg-primary/15 text-primary font-medium"
                                : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground"
                            )}
                          >
                            <child.icon className="w-4 h-4 shrink-0" />
                            <span className="whitespace-nowrap">{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
        </ul>
      </nav>

      {/* User footer */}
      {user && (
        <div className="border-t border-sidebar-border px-3 py-3 shrink-0">
          <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {user.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.nome}</p>
                <p className="text-xs text-sidebar-muted truncate">{user.cargo || user.perfil}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="text-sidebar-muted hover:text-destructive transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            {collapsed && (
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="text-sidebar-muted hover:text-destructive transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
