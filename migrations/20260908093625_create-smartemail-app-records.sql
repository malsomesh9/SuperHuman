CREATE TABLE IF NOT EXISTS public.smartemail_user_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  source text NOT NULL DEFAULT 'demo',
  source_thread_id text,
  source_email_id text,
  due_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT smartemail_user_records_type CHECK (
    record_type IN (
      'email',
      'commitment',
      'waiting',
      'followup',
      'decision',
      'approval',
      'workflow',
      'policy',
      'company',
      'attachment',
      'audit'
    )
  ),
  CONSTRAINT smartemail_user_records_status CHECK (
    status IN ('open', 'waiting', 'pending_approval', 'completed', 'dismissed', 'needs_attention')
  ),
  CONSTRAINT smartemail_user_records_priority CHECK (
    priority IN ('critical', 'high', 'normal', 'low')
  )
);

CREATE INDEX IF NOT EXISTS smartemail_user_records_user_type_status_idx
  ON public.smartemail_user_records (user_id, record_type, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS smartemail_user_records_user_due_idx
  ON public.smartemail_user_records (user_id, due_at)
  WHERE due_at IS NOT NULL;

ALTER TABLE public.smartemail_user_records ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.smartemail_user_records FROM anon, authenticated;

CREATE POLICY smartemail_user_records_own_select ON public.smartemail_user_records
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY smartemail_user_records_own_insert ON public.smartemail_user_records
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY smartemail_user_records_own_update ON public.smartemail_user_records
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY smartemail_user_records_own_delete ON public.smartemail_user_records
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.smartemail_user_records TO authenticated;

CREATE TRIGGER smartemail_user_records_updated_at
  BEFORE UPDATE ON public.smartemail_user_records
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();
