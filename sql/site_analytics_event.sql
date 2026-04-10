CREATE TABLE IF NOT EXISTS site_analytics_event (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  session_id TEXT NULL,
  path TEXT NOT NULL,
  full_path TEXT NULL,
  country_code TEXT NULL,
  duration_seconds INTEGER NULL,
  referrer TEXT NULL,
  user_agent TEXT NULL,
  ip_address TEXT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS IDX_site_analytics_event_deleted_at
  ON site_analytics_event (deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS IDX_site_analytics_event_occurred_at
  ON site_analytics_event (occurred_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS IDX_site_analytics_event_country_code
  ON site_analytics_event (country_code)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS IDX_site_analytics_event_path
  ON site_analytics_event (path)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS IDX_site_analytics_event_visitor_occurred
  ON site_analytics_event (visitor_id, occurred_at)
  WHERE deleted_at IS NULL;