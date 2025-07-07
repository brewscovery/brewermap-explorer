-- Create admin QR codes table for PWA installation prompts
CREATE TABLE public.admin_qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  qr_type TEXT NOT NULL DEFAULT 'pwa_install',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.admin_qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for admin QR codes
CREATE POLICY "Admins can manage admin QR codes" 
ON public.admin_qr_codes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

CREATE POLICY "Anyone can view active admin QR codes" 
ON public.admin_qr_codes 
FOR SELECT 
USING (is_active = true);