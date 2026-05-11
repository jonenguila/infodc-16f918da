CREATE TABLE public.lembretes_pedido (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem integer NOT NULL DEFAULT 0,
  texto text NOT NULL,
  link_url text NOT NULL DEFAULT '',
  link_label text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.lembretes_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view lembretes"
ON public.lembretes_pedido FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Only admins can manage lembretes"
ON public.lembretes_pedido FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_lembretes_pedido_updated_at
BEFORE UPDATE ON public.lembretes_pedido
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.lembretes_pedido (ordem, texto, link_url, link_label) VALUES
  (1, 'Verificar stock com antecedência.', '', ''),
  (2, 'Vigiar os materiais e brindes durante o evento.', '', ''),
  (3, 'Privilegiar oferta a quem segue o Data CoLAB nas redes sociais.', '', ''),
  (4, 'O levantamento é feito na delegação de Viana do Castelo. Caso não consiga levantar, arranjar um colaborador que levante por si.', '', ''),
  (5, 'Contabilizar e devolver os brindes após o evento. Deve ser preenchido o campo "Devolução" no +InfoDataCoLAB, depois do ato da entrega na delegação de Viana do Castelo ao cuidado do colaborador Jorge Rodrigues.', '', ''),
  (6, 'Caso existam brindes não utilizados, estes devem ser devolvidos e registados.', '', ''),
  (7, 'Não te esqueças de registar a tua ida ao evento no formulário:', 'https://forms.office.com/Pages/ResponsePage.aspx?id=WjgSWLKyyEaD2WOOg1g5qNFSEvuXwzROiN58fyl-yUdUMEw2VVExNFRIUDRFM1RRVEM5SFYxUU1KNS4u', 'Requerimentos de Pedidos de Comunicação');