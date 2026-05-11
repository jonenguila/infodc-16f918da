-- 1) Notificacoes: restringir INSERT ao próprio user
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notificacoes;
CREATE POLICY "Users can insert own notifications"
ON public.notificacoes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2) Storage 'images': restringir visualização a autenticados
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
CREATE POLICY "Authenticated users can view images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'images');

-- 3) Revogar EXECUTE em funções de trigger (só devem correr internamente)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;