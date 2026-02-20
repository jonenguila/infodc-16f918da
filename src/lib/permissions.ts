export type Perfil = "Administrador" | "Gestor" | "Utilizador";

const routePermissions: Record<Perfil, string[]> = {
  Administrador: ["*"],
  Gestor: [
    "/", "/produtos", "/servicos", "/projetos",
    "/stock/novo-pedido", "/stock/produtos", "/stock/categorias", "/stock/pedidos", "/stock/delegacoes",
    "/armazem", "/armazem/localizacoes", "/import-export",
    "/comunicacao/pedidos", "/comunicacao/noticias",
  ],
  Utilizador: [
    "/", "/produtos", "/servicos", "/projetos",
    "/stock/novo-pedido", "/stock/produtos", "/stock/pedidos",
    "/comunicacao/pedidos", "/comunicacao/noticias",
  ],
};

const sidebarPermissions: Record<Perfil, string[]> = {
  Administrador: ["*"],
  Gestor: ["Dashboard", "Produtos", "Serviços", "Projetos Financiados", "Stock", "Comunicação"],
  Utilizador: ["Dashboard", "Produtos", "Serviços", "Projetos Financiados", "Stock", "Comunicação"],
};

export function canAccessRoute(perfil: Perfil, path: string): boolean {
  const allowed = routePermissions[perfil];
  if (allowed.includes("*")) return true;
  return allowed.some((r) => path === r || path.startsWith(r + "/"));
}

export function canSeeSidebarGroup(perfil: Perfil, groupLabel: string): boolean {
  const allowed = sidebarPermissions[perfil];
  if (allowed.includes("*")) return true;
  return allowed.includes(groupLabel);
}
