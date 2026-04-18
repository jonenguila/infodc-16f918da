CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funcao TEXT NOT NULL,
  destinatarios TEXT[] NOT NULL DEFAULT '{}',
  cc TEXT[] DEFAULT '{}',
  remetente TEXT NOT NULL,
  assunto TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'sucesso',
  resend_id TEXT,
  erro TEXT,
  referencia TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and gestors can view email_logs"
ON public.email_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Admins and gestors can manage email_logs"
ON public.email_logs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX idx_email_logs_funcao ON public.email_logs(funcao);
CREATE INDEX idx_email_logs_estado ON public.email_logs(estado);