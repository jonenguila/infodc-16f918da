-- Add user_id to track who created a pedido and restrict visibility for utilizadores
ALTER TABLE public.stock_pedidos ADD COLUMN IF NOT EXISTS user_id uuid;

-- Replace the permissive view-all policy with owner-or-staff visibility
DROP POLICY IF EXISTS "Authenticated users can view pedidos" ON public.stock_pedidos;

CREATE POLICY "View own pedidos or staff sees all"
ON public.stock_pedidos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR auth.uid() = user_id
);

-- Ensure inserts always tag the creator (when authenticated)
DROP POLICY IF EXISTS "Authenticated users can create pedidos" ON public.stock_pedidos;

CREATE POLICY "Authenticated users can create pedidos"
ON public.stock_pedidos
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
  OR auth.uid() = user_id
);