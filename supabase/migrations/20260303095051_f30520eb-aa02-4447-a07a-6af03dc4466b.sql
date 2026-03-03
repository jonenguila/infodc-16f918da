
-- Stock: Tipologias
CREATE TABLE public.stock_tipologias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_tipologias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view tipologias" ON public.stock_tipologias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and gestors can manage tipologias" ON public.stock_tipologias FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- Stock: Localizações
CREATE TABLE public.stock_localizacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_localizacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view localizacoes" ON public.stock_localizacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and gestors can manage localizacoes" ON public.stock_localizacoes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- Stock: Produtos
CREATE TABLE public.stock_produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipologia TEXT NOT NULL DEFAULT 'Geral',
  localizacao TEXT DEFAULT '',
  stock_atual INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 40,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view produtos" ON public.stock_produtos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and gestors can manage produtos" ON public.stock_produtos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE TRIGGER update_stock_produtos_updated_at BEFORE UPDATE ON public.stock_produtos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Stock: Pedidos
CREATE TABLE public.stock_pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  data_pedido TEXT NOT NULL,
  nome_requisitante TEXT NOT NULL,
  email TEXT NOT NULL,
  origem TEXT DEFAULT '',
  destino TEXT DEFAULT '',
  descricao_destino TEXT DEFAULT '',
  tipo_evento TEXT DEFAULT '',
  nome_evento TEXT DEFAULT '',
  data_evento TEXT DEFAULT '',
  data_recolha TEXT DEFAULT '',
  responsavel_levantamento TEXT DEFAULT '',
  prioridade TEXT NOT NULL DEFAULT 'Média',
  observacoes TEXT DEFAULT '',
  produtos JSONB NOT NULL DEFAULT '[]',
  estado TEXT NOT NULL DEFAULT 'Pendente',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view pedidos" ON public.stock_pedidos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and gestors can manage pedidos" ON public.stock_pedidos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Authenticated users can create pedidos" ON public.stock_pedidos FOR INSERT TO authenticated WITH CHECK (true);

-- Stock: Movimentos
CREATE TABLE public.stock_movimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES public.stock_produtos(id) ON DELETE SET NULL,
  produto_nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('levantamento', 'devolucao')),
  quantidade INTEGER NOT NULL,
  data TEXT NOT NULL,
  responsavel TEXT DEFAULT '',
  evento TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_movimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view movimentos" ON public.stock_movimentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and gestors can manage movimentos" ON public.stock_movimentos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- Stock: Pedidos Levantamento
CREATE TABLE public.stock_pedidos_levantamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES public.stock_produtos(id) ON DELETE SET NULL,
  produto_nome TEXT NOT NULL,
  quantidade_levantada INTEGER NOT NULL DEFAULT 0,
  quantidade_devolvida INTEGER NOT NULL DEFAULT 0,
  consumo_real INTEGER NOT NULL DEFAULT 0,
  responsavel TEXT DEFAULT '',
  evento TEXT DEFAULT '',
  data TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_pedidos_levantamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view pedidos_levantamento" ON public.stock_pedidos_levantamento FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and gestors can manage pedidos_levantamento" ON public.stock_pedidos_levantamento FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- Stock: Documentos Devolução
CREATE TABLE public.stock_documentos_devolucao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  nome_evento TEXT DEFAULT '',
  data_entrega TEXT NOT NULL,
  responsavel TEXT DEFAULT '',
  produtos JSONB NOT NULL DEFAULT '[]',
  observacoes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_documentos_devolucao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view documentos_devolucao" ON public.stock_documentos_devolucao FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and gestors can manage documentos_devolucao" ON public.stock_documentos_devolucao FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));

-- Sequence for pedido numbers
CREATE TABLE public.stock_config (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.stock_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view config" ON public.stock_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and gestors can manage config" ON public.stock_config FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor'));
INSERT INTO public.stock_config (key, value) VALUES ('next_pedido_number', 1);

-- Seed default tipologias
INSERT INTO public.stock_tipologias (nome, descricao) VALUES
  ('Escritório', 'Material de escritório e papelaria'),
  ('Vestuário', 'Roupa e acessórios corporativos'),
  ('Lifestyle', 'Artigos de lifestyle e bem-estar'),
  ('Tecnologia', 'Gadgets e acessórios tecnológicos');

-- Seed default localizações
INSERT INTO public.stock_localizacoes (nome, descricao) VALUES
  ('Sede', 'Escritório principal'),
  ('Armazém', 'Armazém central de stock');

-- Seed default produtos
INSERT INTO public.stock_produtos (nome, tipologia, localizacao, stock_atual, stock_minimo) VALUES
  ('Caneta Data CoLAB', 'Escritório', 'Sede', 150, 40),
  ('Bloco de Notas A5', 'Escritório', 'Sede', 45, 40),
  ('Mochila Corporativa', 'Vestuário', 'Armazém', 12, 40),
  ('T-Shirt Data CoLAB', 'Vestuário', 'Armazém', 0, 40),
  ('Garrafa Termos', 'Lifestyle', 'Sede', 25, 40),
  ('Pen USB 32GB', 'Tecnologia', 'Sede', 8, 40),
  ('Tote Bag', 'Lifestyle', 'Armazém', 0, 40),
  ('Calendário 2025', 'Escritório', 'Sede', 60, 40);
