-- Create enum for order status
CREATE TYPE order_status AS ENUM (
  'pending',
  'pending_payment',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

-- Create enum for payment methods
CREATE TYPE payment_method AS ENUM (
  'cod',
  'easypaisa',
  'jazzcash',
  'bank_transfer',
  'card'
);

-- Create enum for payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'cancelled'
);

-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table (supports both registered and guest users)
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  short_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Guest user info (if user_id is null)
  guest_name TEXT,
  guest_phone TEXT,
  guest_email TEXT,
  
  -- Order details
  status order_status NOT NULL DEFAULT 'pending',
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  
  -- Address (can reference user_addresses or be inline for guests)
  address_id UUID REFERENCES public.user_addresses(id),
  delivery_address TEXT NOT NULL,
  delivery_area TEXT NOT NULL,
  delivery_floor TEXT,
  delivery_instructions TEXT,
  delivery_lat DECIMAL(10, 8),
  delivery_lng DECIMAL(11, 8),
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  promo_code_id UUID REFERENCES public.promo_codes(id),
  total DECIMAL(10, 2) NOT NULL,
  
  -- Payment details
  stripe_payment_intent_id TEXT,
  bank_reference_number TEXT,
  payment_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Rider assignment
  rider_id UUID,
  rider_assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  auto_cancel_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT guest_or_user CHECK (
    (user_id IS NOT NULL AND guest_name IS NULL AND guest_phone IS NULL) OR
    (user_id IS NULL AND guest_name IS NOT NULL AND guest_phone IS NOT NULL)
  )
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL,
  menu_item_name TEXT NOT NULL,
  menu_item_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  addons JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_status_history table for tracking
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_orders_short_id ON public.orders(short_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_guest_phone ON public.orders(guest_phone);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_codes
CREATE POLICY "Promo codes are viewable by everyone"
  ON public.promo_codes FOR SELECT
  USING (is_active = true);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id OR
    true -- Allow public read for tracking by short_id
  );

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    user_id IS NULL -- Allow guest orders
  );

CREATE POLICY "Users can update their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for order_items
CREATE POLICY "Order items are viewable with order"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR true)
    )
  );

CREATE POLICY "Order items can be created with order"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

-- RLS Policies for order_status_history
CREATE POLICY "Order status history is viewable with order"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND (orders.user_id = auth.uid() OR true)
    )
  );

CREATE POLICY "Order status history can be created"
  ON public.order_status_history FOR INSERT
  WITH CHECK (true);

-- Function to generate short order ID
CREATE OR REPLACE FUNCTION generate_short_order_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to set short_id on insert
CREATE OR REPLACE FUNCTION set_order_short_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.short_id IS NULL THEN
    NEW.short_id := generate_short_order_id();
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.orders WHERE short_id = NEW.short_id) LOOP
      NEW.short_id := generate_short_order_id();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to generate bank reference number
CREATE OR REPLACE FUNCTION generate_bank_reference()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  -- Use different prefix for guest vs registered
  prefix := 'FOOD-';
  
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  RETURN prefix || result;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to set bank reference for bank transfer orders
CREATE OR REPLACE FUNCTION set_bank_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_method = 'bank_transfer' AND NEW.bank_reference_number IS NULL THEN
    NEW.bank_reference_number := generate_bank_reference();
    -- Set auto-cancel time to 15 minutes from now
    NEW.auto_cancel_at := now() + INTERVAL '15 minutes';
    NEW.status := 'pending_payment';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to track status changes
CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.order_status_history (order_id, status, created_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.order_status_history (order_id, status, created_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to update promo code usage
CREATE OR REPLACE FUNCTION update_promo_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.promo_code_id IS NOT NULL THEN
    UPDATE public.promo_codes
    SET used_count = used_count + 1
    WHERE id = NEW.promo_code_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers
CREATE TRIGGER set_order_short_id_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_short_id();

CREATE TRIGGER set_bank_reference_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_bank_reference();

CREATE TRIGGER track_order_status_trigger
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION track_order_status_change();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_promo_usage_trigger
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_usage();

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;

-- Insert sample promo codes
INSERT INTO public.promo_codes (code, discount_type, discount_value, min_order_amount, max_discount_amount, valid_until, usage_limit)
VALUES
  ('WELCOME10', 'percentage', 10, 500, 200, now() + INTERVAL '30 days', 100),
  ('SAVE50', 'fixed', 50, 300, NULL, now() + INTERVAL '30 days', 50),
  ('FREESHIP', 'fixed', 100, 0, 100, now() + INTERVAL '30 days', NULL);