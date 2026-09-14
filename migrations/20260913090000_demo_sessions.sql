CREATE TABLE IF NOT EXISTS public.smartemail_demo_sessions (
  id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{64}$'),
  state jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 day')
);
ALTER TABLE public.smartemail_demo_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.smartemail_demo_sessions FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS smartemail_demo_expiry ON public.smartemail_demo_sessions(expires_at);
COMMENT ON TABLE public.smartemail_demo_sessions IS 'Synthetic demo data only. Server-only access via hashed random HttpOnly session cookies; no real mailbox data.';

CREATE OR REPLACE FUNCTION public.limit_smartemail_demo_sessions() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(13092026);
  DELETE FROM public.smartemail_demo_sessions WHERE expires_at < now();
  IF (SELECT count(*) FROM public.smartemail_demo_sessions) >= 2000 THEN
    RAISE EXCEPTION 'Demo capacity reached';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER smartemail_demo_capacity BEFORE INSERT ON public.smartemail_demo_sessions
FOR EACH ROW EXECUTE FUNCTION public.limit_smartemail_demo_sessions();
REVOKE ALL ON FUNCTION public.limit_smartemail_demo_sessions() FROM PUBLIC, anon, authenticated;
