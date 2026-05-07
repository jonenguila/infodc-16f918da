export type Perfil = "Administrador" | "Gestor" | "Utilizador";

const routePermissions: Record<Perfil, string[]> = {
  Administrador: ["*"],
  Gestor: [
    "/", "/produtos", "/servicos", "/projetos",
    "/stock", "/stock/produtos", "/stock/tipologias", "/stock/localizacoes",
    "/stock/pedidos", "/stock/devolucao", "/stock/novo-pedido", "/stock/historico", "/stock/listagem-pedidos",
    "/comunicacao/pedidos", "/comunicacao/newsletter", "/comunicacao/links",
  ],
  Utilizador: [
    "/",
    "/stock", "/stock/produtos", "/stock/tipologias", "/stock/localizacoes",
    "/stock/pedidos", "/stock/devolucao", "/stock/novo-pedido", "/stock/historico", "/stock/listagem-pedidos",
    "/comunicacao/pedidos", "/comunicacao/newsletter", "/comunicacao/links",
  ],
};

const sidebarPermissions: Record<Perfil, string[]> = {
  Administrador: ["*"],
  Gestor: ["Dashboard", "Produtos", "Serviços", "Projetos Financiados", "Stock", "Comunicação"],
  Utilizador: ["Dashboard", "Stock", "Comunicação"],
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
