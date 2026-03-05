
-- Produtos images (keyed by product id as integer)
CREATE TABLE public.produtos_imagens (
  id INTEGER PRIMARY KEY,
  imagem_url TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.produtos_imagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view produtos_imagens"
  ON public.produtos_imagens FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and gestors can manage produtos_imagens"
  ON public.produtos_imagens FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

-- Seed default product rows
INSERT INTO public.produtos_imagens (id) VALUES (1), (2), (3), (4);

-- Projetos images (keyed by project id as integer)
CREATE TABLE public.projetos_imagens (
  id INTEGER PRIMARY KEY,
  imagem_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projetos_imagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view projetos_imagens"
  ON public.projetos_imagens FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and gestors can manage projetos_imagens"
  ON public.projetos_imagens FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

-- Seed default project rows
INSERT INTO public.projetos_imagens (id) VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9), (10), (11);
