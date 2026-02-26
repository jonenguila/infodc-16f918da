import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Package, Wrench, FolderKanban, Box,
  ClipboardList, Users, Megaphone, Newspaper,
  ChevronDown, Info, ShieldCheck, List,
  FileSpreadsheet, LogOut, LayoutDashboard,
  ChevronsLeft, ChevronsRight, BarChart3, History, RotateCcw, FilePlus2,
  Tag, MapPin, DatabaseBackup, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { canSeeSidebarGroup } from "@/lib/permissions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
      { label: "Overview", icon: BarChart3, path: "/stock" },
      { label: "Produtos", icon: Package, path: "/stock/produtos" },
      { label: "Tipologias", icon: Tag, path: "/stock/tipologias" },
      { label: "Localizações", icon: MapPin, path: "/stock/localizacoes" },
      { label: "Novo Pedido", icon: FilePlus2, path: "/stock/novo-pedido" },
      { label: "Listagem Pedidos", icon: List, path: "/stock/listagem-pedidos" },
      { label: "Devolução", icon: RotateCcw, path: "/stock/devolucao" },
      { label: "Histórico", icon: History, path: "/stock/historico" },
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
      { label: "Utilizadores", icon: Users, path: "/admin/utilizadores" },
      { label: "Permissões", icon: Shield, path: "/admin/permissoes" },
      { label: "Backup & Restauro", icon: DatabaseBackup, path: "/admin/backup" },
    ],
  },
];

const STORAGE_KEY = "erp-sidebar-collapsed";

interface ERPSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function ERPSidebar({ collapsed, onToggle }: ERPSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // Auto-open group that contains active route
  useEffect(() => {
    if (collapsed) return;
    menuItems.forEach((item) => {
      if (item.children?.some((c) => location.pathname.startsWith(c.path))) {
        setOpenGroups((prev) =>
          prev.includes(item.label) ? prev : [...prev, item.label]
        );
      }
    });
  }, [location.pathname, collapsed]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (item: MenuItem) =>
    item.children?.some((c) => location.pathname.startsWith(c.path)) ?? false;

  const renderSimpleItem = (item: MenuItem) => {
    const active = isActive(item.path!);
    const linkContent = (
      <Link
        to={item.path!}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          collapsed ? "justify-center" : "",
          active
            ? "bg-[hsl(var(--sidebar-active)/0.15)] text-[hsl(var(--sidebar-primary))]"
            : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--foreground))]"
        )}
      >
        <item.icon className="w-[18px] h-[18px] shrink-0" />
        {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <li key={item.label}>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              {item.label}
            </TooltipContent>
          </Tooltip>
        </li>
      );
    }

    return <li key={item.label}>{linkContent}</li>;
  };

  const renderGroupItem = (item: MenuItem) => {
    const groupOpen = openGroups.includes(item.label) && !collapsed;
    const groupActive = isGroupActive(item);

    // Collapsed: show popover with children on hover
    if (collapsed) {
      return (
        <li key={item.label}>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  groupActive
                    ? "bg-[hsl(var(--sidebar-active)/0.15)] text-[hsl(var(--sidebar-primary))]"
                    : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              sideOffset={12}
              className="w-48 p-1 bg-[hsl(var(--sidebar-background))] border-[hsl(var(--sidebar-border))]"
            >
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-muted))]">
                {item.label}
              </p>
              {item.children?.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive(child.path)
                      ? "bg-[hsl(var(--sidebar-active)/0.15)] text-[hsl(var(--sidebar-primary))] font-medium"
                      : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--foreground))]"
                  )}
                >
                  <child.icon className="w-4 h-4 shrink-0" />
                  <span>{child.label}</span>
                </Link>
              ))}
            </PopoverContent>
          </Popover>
        </li>
      );
    }

    // Expanded: collapsible group
    return (
      <li key={item.label}>
        <button
          onClick={() => toggleGroup(item.label)}
          className={cn(
            "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            groupActive
              ? "bg-[hsl(var(--sidebar-active)/0.15)] text-[hsl(var(--sidebar-primary))]"
              : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--foreground))]"
          )}
        >
          <item.icon className="w-[18px] h-[18px] shrink-0" />
          <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[hsl(var(--sidebar-muted))] transition-transform duration-200",
              groupOpen ? "rotate-0" : "-rotate-90"
            )}
          />
        </button>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            groupOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <ul className="mt-0.5 ml-4 pl-4 border-l border-[hsl(var(--sidebar-border))] space-y-0.5">
            {item.children?.map((child) => (
              <li key={child.path}>
                <Link
                  to={child.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200",
                    isActive(child.path)
                      ? "bg-[hsl(var(--sidebar-active)/0.15)] text-[hsl(var(--sidebar-primary))] font-medium"
                      : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--foreground))]"
                  )}
                >
                  <child.icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{child.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </li>
    );
  };

  return (
    <aside
      className={cn(
        "flex flex-col min-h-screen bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-[60px]" : "w-64"
      )}
    >
      {/* Header: Logo + Toggle */}
      <div className="flex items-center border-b border-[hsl(var(--sidebar-border))] shrink-0 h-[60px] px-2">
        {!collapsed && (
          <div className="flex items-center gap-3 flex-1 min-w-0 pl-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(var(--sidebar-primary)/0.2)] shrink-0">
              <Info className="w-4 h-4 text-[hsl(var(--sidebar-primary))]" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-[hsl(var(--foreground))] whitespace-nowrap">+ INFO</span>
              <p className="text-[11px] text-[hsl(var(--sidebar-muted))] whitespace-nowrap">Data CoLAB</p>
            </div>
          </div>
        )}

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={onToggle}
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-lg text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--sidebar-hover))] transition-all duration-200 shrink-0",
                collapsed ? "mx-auto" : "ml-auto"
              )}
            >
              {collapsed ? (
                <ChevronsRight className="w-[18px] h-[18px]" />
              ) : (
                <ChevronsLeft className="w-[18px] h-[18px]" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {collapsed ? "Expandir menu" : "Recolher menu"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-muted))] whitespace-nowrap">
            Menu Principal
          </p>
        )}

        <ul className="space-y-0.5">
          {menuItems
            .filter((item) => (user ? canSeeSidebarGroup(user.perfil, item.label) : false))
            .map((item) =>
              item.path && !item.children
                ? renderSimpleItem(item)
                : renderGroupItem(item)
            )}
        </ul>
      </nav>

      {/* User footer */}
      {user && (
        <div className="border-t border-[hsl(var(--sidebar-border))] px-2 py-3 shrink-0">
          <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 shrink-0 cursor-default">
                  <AvatarFallback className="bg-[hsl(var(--sidebar-primary)/0.2)] text-[hsl(var(--sidebar-primary))] text-xs font-semibold">
                    {user.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" sideOffset={8}>
                  {user.nome}
                </TooltipContent>
              )}
            </Tooltip>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{user.nome}</p>
                <p className="text-xs text-[hsl(var(--sidebar-muted))] truncate">{user.cargo || user.perfil}</p>
              </div>
            )}

            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => { logout(); navigate("/login"); }}
                    className="text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--destructive))] transition-colors mt-2"
                    aria-label="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>Sair</TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
