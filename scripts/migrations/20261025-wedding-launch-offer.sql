-- Apply explicitly after review, in a transaction. No album/photo rows are modified.
ALTER TABLE bank_orders ALTER COLUMN plan_price TYPE numeric(12,2) USING plan_price::numeric;
CREATE TABLE IF NOT EXISTS wedding_offer_slots (
  campaign_id text NOT NULL,
  slot integer NOT NULL CHECK (slot BETWEEN 1 AND 20),
  state text NOT NULL DEFAULT 'available' CHECK (state IN ('available', 'reserved', 'paid')),
  customer_id text,
  album_slug text,
  method text CHECK (method IN ('card', 'invoice')),
  attempt_id text,
  payment_ref text,
  reserved_at timestamptz,
  PRIMARY KEY (campaign_id, slot),
  CHECK ((state = 'available' AND customer_id IS NULL AND attempt_id IS NULL)
    OR (state <> 'available' AND customer_id IS NOT NULL AND attempt_id IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS wedding_offer_customer ON wedding_offer_slots(campaign_id, customer_id) WHERE customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS wedding_offer_attempt ON wedding_offer_slots(attempt_id) WHERE attempt_id IS NOT NULL;
INSERT INTO wedding_offer_slots(campaign_id, slot)
  SELECT 'wedding-launch-189-30-20261025', generate_series(1,20)
  ON CONFLICT (campaign_id, slot) DO NOTHING;
