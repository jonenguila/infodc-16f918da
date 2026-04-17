-- Tabela para cards dinâmicos das secções de Comunicação
CREATE TABLE public.comunicacao_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seccao TEXT NOT NULL CHECK (seccao IN ('novos_pedidos', 'newsletter', 'outros_links')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  icone TEXT NOT NULL DEFAULT 'FileText',
  texto_botao TEXT NOT NULL DEFAULT 'Aceder',
  link TEXT NOT NULL DEFAULT '',
  abrir_nova_aba BOOLEAN NOT NULL DEFAULT true,
  cor TEXT NOT NULL DEFAULT 'bg-primary/10 text-primary',
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comunicacao_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view comunicacao_cards"
ON public.comunicacao_cards FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and gestors can manage comunicacao_cards"
ON public.comunicacao_cards FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE TRIGGER update_comunicacao_cards_updated_at
BEFORE UPDATE ON public.comunicacao_cards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_comunicacao_cards_seccao ON public.comunicacao_cards(seccao, ordem);

-- Migrar cards existentes
INSERT INTO public.comunicacao_cards (seccao, titulo, descricao, icone, texto_botao, link, abrir_nova_aba, cor, ordem) VALUES
-- Novos Pedidos
('novos_pedidos', 'Requerimento de Pedidos de Comunicação', 'Submissão de pedidos relacionados com ações de comunicação.', 'Megaphone', 'Aceder ao formulário', 'https://forms.office.com/Pages/ResponsePage.aspx?id=WjgSWLKyyEaD2WOOg1g5qNFSEvuXwzROiN58fyl-yUdUMEw2VVExNFRIUDRFM1RRVEM5SFYxUU1KNS4u', true, 'bg-primary/10 text-primary', 1),
('novos_pedidos', 'Formulário Briefing de Logo', 'Pedido de criação ou desenvolvimento de logotipo.', 'FileText', 'Aceder ao formulário', 'https://forms.office.com/Pages/ResponsePage.aspx?id=WjgSWLKyyEaD2WOOg1g5qNFSEvuXwzROiN58fyl-yUdUME1LUFZRRUo1ODJYVERSMVkwSVlEVEhMWi4u', true, 'bg-primary/10 text-primary', 2),
('novos_pedidos', 'Comunicação de Projetos Financiados', 'Submissão de informação para comunicação de projetos financiados.', 'FolderKanban', 'Aceder ao formulário', 'https://forms.office.com/Pages/ResponsePage.aspx?id=WjgSWLKyyEaD2WOOg1g5qNFSEvuXwzROiN58fyl-yUdUQU9QSlNORlI5TFdZNVhaS1I0MkxGQjVOWC4u', true, 'bg-primary/10 text-primary', 3),
-- Newsletter
('newsletter', 'Newsletter Dezembro 2024', 'Balanço anual e destaques de 2024.', 'FileText', 'Ver / Descarregar PDF', '', true, 'bg-red-500/10 text-red-600', 1),
('newsletter', 'Newsletter Outubro 2024', 'Novas parcerias e formações.', 'FileText', 'Ver / Descarregar PDF', '', true, 'bg-red-500/10 text-red-600', 2),
-- Outros Links
('outros_links', 'Design e Comunicação', 'Recursos de design e comunicação', 'Palette', 'Aceder', 'https://associacaodatacolab.sharepoint.com/:f:/s/recursoshumanos/IgCGQgi7rEuBSp5nWhFNJ0w8AYS1zBfFQSmZts_SCif76Xk?e=8ALTS7', true, 'bg-purple-500/10 text-purple-600', 1),
('outros_links', 'Logos Data CoLAB', 'Repositório de logótipos oficiais', 'Image', 'Aceder', 'https://associacaodatacolab.sharepoint.com/:f:/s/recursoshumanos/IgD1zS7ccomqS4mv-mggFeSJAXlf85iCxH9cA2rsfDzJhw4?e=lEDQDR', true, 'bg-emerald-500/10 text-emerald-600', 2),
('outros_links', 'Templates', 'Templates e modelos institucionais', 'FileText', 'Aceder', 'https://associacaodatacolab.sharepoint.com/:f:/s/recursoshumanos/IgAvMqBcymd-TIdnxCgFIJqAAdxW9MzjGvAeiaKvOD9Qjtc?e=FhbVsb', true, 'bg-amber-500/10 text-amber-600', 3),
('outros_links', 'Vídeos', 'Repositório de vídeos institucionais', 'Video', 'Aceder', 'https://associacaodatacolab.sharepoint.com/:f:/s/recursoshumanos/IgCbO9EF4VznQooRKmQnNYkdAdXaTaJW-_ChPphzN9AYY5A?e=NvSjAE', true, 'bg-red-500/10 text-red-600', 4);