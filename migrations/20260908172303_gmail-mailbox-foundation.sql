CREATE TABLE public.smartemail_gmail_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  credentials text NOT NULL,
  status text NOT NULL DEFAULT 'connected',
  history_id text,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, email), UNIQUE(user_id, id)
);
CREATE TABLE public.smartemail_gmail_messages (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL,
  gmail_id text NOT NULL,
  thread_id text NOT NULL,
  subject text NOT NULL DEFAULT '',
  sender text NOT NULL DEFAULT '',
  snippet text NOT NULL DEFAULT '',
  labels text[] NOT NULL DEFAULT '{}',
  internal_date timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(account_id, gmail_id),
  FOREIGN KEY(user_id, account_id) REFERENCES public.smartemail_gmail_accounts(user_id, id) ON DELETE CASCADE
);
CREATE INDEX smartemail_gmail_messages_user_date ON public.smartemail_gmail_messages(user_id, account_id, internal_date DESC);
CREATE TABLE public.smartemail_gmail_sends (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL,
  request_hash text NOT NULL,
  status text NOT NULL CHECK(status IN ('sending','sent','uncertain')),
  gmail_id text,
  thread_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(user_id, account_id) REFERENCES public.smartemail_gmail_accounts(user_id, id) ON DELETE CASCADE
);
CREATE TABLE public.smartemail_gmail_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL,
  action text NOT NULL,
  resource_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(user_id, account_id) REFERENCES public.smartemail_gmail_accounts(user_id, id) ON DELETE CASCADE
);
CREATE INDEX smartemail_gmail_audit_user_date ON public.smartemail_gmail_audit(user_id, created_at DESC);

ALTER TABLE public.smartemail_gmail_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartemail_gmail_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartemail_gmail_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartemail_gmail_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.smartemail_gmail_accounts, public.smartemail_gmail_messages, public.smartemail_gmail_sends, public.smartemail_gmail_audit FROM anon, authenticated;
-- Credentials and provider mutations are accessible only through the authenticated server.
CREATE POLICY gmail_accounts_owner ON public.smartemail_gmail_accounts FOR ALL TO authenticated USING(user_id = (SELECT auth.uid())) WITH CHECK(user_id = (SELECT auth.uid()));
CREATE POLICY gmail_messages_owner_read ON public.smartemail_gmail_messages FOR SELECT TO authenticated USING(user_id = (SELECT auth.uid()));
CREATE POLICY gmail_sends_owner_read ON public.smartemail_gmail_sends FOR SELECT TO authenticated USING(user_id = (SELECT auth.uid()));
CREATE POLICY gmail_audit_owner_read ON public.smartemail_gmail_audit FOR SELECT TO authenticated USING(user_id = (SELECT auth.uid()));
GRANT SELECT ON public.smartemail_gmail_messages, public.smartemail_gmail_sends, public.smartemail_gmail_audit TO authenticated;
CREATE TRIGGER gmail_accounts_updated BEFORE UPDATE ON public.smartemail_gmail_accounts FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();
CREATE TRIGGER gmail_messages_updated BEFORE UPDATE ON public.smartemail_gmail_messages FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();
