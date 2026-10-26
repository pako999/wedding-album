-- Twenty-place maximum, with eight places released in the current batch.
-- Unreleased places are not sold or reserved. Existing paid/pending claims are preserved.
ALTER TABLE bank_orders ALTER COLUMN plan_price TYPE numeric(12,2) USING plan_price::numeric;
CREATE TABLE IF NOT EXISTS wedding_offer_slots (
  campaign_id text NOT NULL,
  slot integer NOT NULL CHECK (slot BETWEEN 1 AND 20),
  state text NOT NULL DEFAULT 'available' CHECK (state IN ('available', 'unreleased', 'reserved', 'paid')),
  customer_id text,
  album_slug text,
  method text CHECK (method IN ('card', 'invoice')),
  attempt_id text,
  payment_ref text,
  reserved_at timestamptz,
  PRIMARY KEY (campaign_id, slot),
  CHECK ((state IN ('available', 'unreleased') AND customer_id IS NULL AND attempt_id IS NULL)
    OR (state IN ('reserved', 'paid') AND customer_id IS NOT NULL AND attempt_id IS NOT NULL))
);
ALTER TABLE wedding_offer_slots
  DROP CONSTRAINT IF EXISTS wedding_offer_slots_state_check,
  DROP CONSTRAINT IF EXISTS wedding_offer_slots_check,
  ADD CONSTRAINT wedding_offer_slots_state_check CHECK (state IN ('available', 'unreleased', 'reserved', 'paid')),
  ADD CONSTRAINT wedding_offer_slots_check CHECK (
    (state IN ('available', 'unreleased') AND customer_id IS NULL AND attempt_id IS NULL)
    OR (state IN ('reserved', 'paid') AND customer_id IS NOT NULL AND attempt_id IS NOT NULL));
CREATE UNIQUE INDEX IF NOT EXISTS wedding_offer_customer ON wedding_offer_slots(campaign_id, customer_id) WHERE customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS wedding_offer_attempt ON wedding_offer_slots(attempt_id) WHERE attempt_id IS NOT NULL;
INSERT INTO wedding_offer_slots(campaign_id, slot, state)
  SELECT 'wedding-launch-189-40-eight-20261025', number,
    CASE WHEN number <= 8 THEN 'available' ELSE 'unreleased' END FROM generate_series(1,20) AS number
  ON CONFLICT (campaign_id, slot) DO NOTHING;
UPDATE wedding_offer_slots SET state = 'unreleased'
  WHERE campaign_id = 'wedding-launch-189-40-eight-20261025' AND slot > 8 AND state = 'available';
