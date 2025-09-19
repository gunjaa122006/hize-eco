-- Add RLS policy to allow users to create their own redeem codes
CREATE POLICY "Users can create their own redeem codes"
ON public.redeem_codes
FOR INSERT
WITH CHECK (auth.uid() = user_id);