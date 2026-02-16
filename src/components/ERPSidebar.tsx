import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Package,
  Wrench,
  FolderKanban,
  Box,
  PlusCircle,
  LayoutDashboard,
  Tags,
  ClipboardList,
  Users,
  Download,
  Upload,
  Megaphone,
  Newspaper,
  ChevronDown,
  ChevronRight,
  Info,
  Warehouse,
  MapPin,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; icon: React.ElementType; path: string }[];
}

const menuItems: MenuItem[] = [
  {
    label: "Produtos",
    icon: Package,
    children: [
      { label: "Lista", icon: ClipboardList, path: "/produtos" },
      { label: "Categorias", icon: Tags, path: "/produtos/categorias" },
    ],
  },
  {
    label: "Serviços",
    icon: Wrench,
    children: [
      { label: "Lista", icon: ClipboardList, path: "/servicos" },
    ],
  },
  {
    label: "Projetos Financiados",
    icon: FolderKanban,
    children: [
      { label: "Lista", icon: ClipboardList, path: "/projetos" },
    ],
  },
  {
    label: "Stock",
    icon: Box,
    children: [
      { label: "Novo Pedido", icon: PlusCircle, path: "/stock/novo-pedido" },
      { label: "Dashboard", icon: LayoutDashboard, path: "/stock/dashboard" },
      { label: "Categorias", icon: Tags, path: "/stock/categorias" },
      { label: "Pedidos", icon: ClipboardList, path: "/stock/pedidos" },
      { label: "Utilizadores", icon: Users, path: "/stock/utilizadores" },
    ],
  },
  {
    label: "Armazém",
    icon: Warehouse,
    children: [
      { label: "Armazéns", icon: Warehouse, path: "/armazem" },
      { label: "Localizações", icon: MapPin, path: "/armazem/localizacoes" },
    ],
  },
  {
    label: "Importar / Exportar",
    icon: FileSpreadsheet,
    children: [
      { label: "Importar", icon: Upload, path: "/import-export" },
      { label: "Exportar", icon: Download, path: "/import-export" },
    ],
  },
  {
    label: "Administração",
    icon: ShieldCheck,
    children: [
      { label: "Permissões", icon: ShieldCheck, path: "/admin/permissoes" },
      { label: "Utilizadores", icon: Users, path: "/stock/utilizadores" },
    ],
  },
  {
    label: "Comunicação",
    icon: Megaphone,
    children: [
      { label: "Pedidos", icon: ClipboardList, path: "/comunicacao/pedidos" },
      { label: "Notícias", icon: Newspaper, path: "/comunicacao/noticias" },
    ],
  },
];

export function ERPSidebar() {
  const location = useLocation();
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
    <aside className="flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
          <Info className="w-5 h-5 text-primary" />
        </div>
        <div>
          <span className="text-sm font-semibold text-foreground">+ INFO</span>
          <p className="text-xs text-sidebar-muted">Data CoLAB</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
          Menu Principal
        </p>

        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const groupOpen = openGroups.includes(item.label);
            const groupActive = isGroupActive(item);

            return (
              <li key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    groupActive
                      ? "bg-sidebar-active/15 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground"
                  )}
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {groupOpen ? (
                    <ChevronDown className="w-4 h-4 text-sidebar-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-sidebar-muted" />
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
                          <span>{child.label}</span>
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
    </aside>
  );
}
