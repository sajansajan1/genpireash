-- Migration: Create user_utm_tracking table
-- Stores UTM/campaign attribution data for users
-- Supports both first-touch and last-touch attribution models

CREATE TABLE IF NOT EXISTS user_utm_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Attribution type
  attribution_type TEXT NOT NULL DEFAULT 'first_touch', -- 'first_touch', 'last_touch', 'signup', 'conversion'

  -- Standard UTM parameters
  utm_source TEXT,           -- e.g., google, facebook, newsletter
  utm_medium TEXT,           -- e.g., cpc, email, social, organic
  utm_campaign TEXT,         -- e.g., summer_sale, product_launch
  utm_term TEXT,             -- Paid search keywords
  utm_content TEXT,          -- Ad/content variant
  utm_id TEXT,               -- Campaign ID

  -- Ad platform click IDs
  gclid TEXT,                -- Google Click ID
  fbclid TEXT,               -- Facebook Click ID
  ttclid TEXT,               -- TikTok Click ID
  msclkid TEXT,              -- Microsoft/Bing Click ID

  -- Referral tracking
  referral_code TEXT,        -- Referral/affiliate code used

  -- Session context
  landing_page TEXT,         -- First page user landed on
  referrer_url TEXT,         -- Full referrer URL

  -- User agent info (useful for device/browser analysis)
  user_agent TEXT,

  -- Event context (what triggered this UTM capture)
  event_type TEXT,           -- 'visit', 'signup', 'purchase', etc.
  event_value DECIMAL(10,2), -- Value associated with event (e.g., purchase amount)
  event_currency TEXT,       -- Currency for event_value

  -- Timestamps
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_attribution_type CHECK (attribution_type IN ('first_touch', 'last_touch', 'signup', 'conversion', 'visit'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_utm_user_id ON user_utm_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_utm_source ON user_utm_tracking(utm_source);
CREATE INDEX IF NOT EXISTS idx_utm_campaign ON user_utm_tracking(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_utm_medium ON user_utm_tracking(utm_medium);
CREATE INDEX IF NOT EXISTS idx_utm_attribution_type ON user_utm_tracking(attribution_type);
CREATE INDEX IF NOT EXISTS idx_utm_captured_at ON user_utm_tracking(captured_at);
CREATE INDEX IF NOT EXISTS idx_utm_event_type ON user_utm_tracking(event_type);

-- Composite index for user attribution queries
CREATE INDEX IF NOT EXISTS idx_utm_user_attribution ON user_utm_tracking(user_id, attribution_type);

-- Enable Row Level Security
ALTER TABLE user_utm_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own UTM data
CREATE POLICY "Users can view own UTM data" ON user_utm_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can insert UTM data
CREATE POLICY "Service can insert UTM data" ON user_utm_tracking
  FOR INSERT WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE user_utm_tracking IS 'Stores UTM and campaign attribution data for users';
COMMENT ON COLUMN user_utm_tracking.attribution_type IS 'Type of attribution: first_touch (original), last_touch (most recent), signup (at registration), conversion (at purchase)';
COMMENT ON COLUMN user_utm_tracking.utm_source IS 'Traffic source identifier (e.g., google, facebook, newsletter)';
COMMENT ON COLUMN user_utm_tracking.utm_medium IS 'Marketing medium (e.g., cpc, email, social)';
COMMENT ON COLUMN user_utm_tracking.utm_campaign IS 'Campaign name for grouping';
COMMENT ON COLUMN user_utm_tracking.gclid IS 'Google Click ID for Google Ads attribution';
COMMENT ON COLUMN user_utm_tracking.fbclid IS 'Facebook Click ID for Meta Ads attribution';
COMMENT ON COLUMN user_utm_tracking.event_type IS 'What event triggered this UTM capture';

-- Create a view for easy campaign performance analysis
CREATE OR REPLACE VIEW campaign_attribution_summary AS
SELECT
  utm_campaign,
  utm_source,
  utm_medium,
  attribution_type,
  event_type,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_events,
  SUM(event_value) as total_value,
  MIN(captured_at) as first_capture,
  MAX(captured_at) as last_capture
FROM user_utm_tracking
WHERE utm_campaign IS NOT NULL
GROUP BY utm_campaign, utm_source, utm_medium, attribution_type, event_type;

COMMENT ON VIEW campaign_attribution_summary IS 'Aggregated view of campaign performance by attribution type';
