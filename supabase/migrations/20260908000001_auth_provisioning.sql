-- ============================================================
-- Auth provisioning — WBS 1.3.1 / 5.1.1
-- ============================================================
-- Internal CSH users authenticate via Google Workspace SSO and should be
-- auto-provisioned to the internal_standard tier on first login, with no
-- manual step. External users (architects, contractors, firm partners)
-- are provisioned manually by the Platform Owner (WBS 5.2.1, a separate
-- admin flow that inserts their `users` row — and their invite — ahead of
-- time) and sign in via magic link.
--
-- supabase/config.toml sets `auth.email.enable_signup = false`, which
-- blocks a fresh email/magic-link identity from self-registering — so a
-- magic-link sign-in only succeeds for an email GoTrue already knows
-- about (created via the admin invite flow, not this trigger). Google
-- OAuth is a separately-enabled provider and is unaffected by that flag,
-- which is what makes "auto-provision on first Google login" safe: it
-- can't be used as a backdoor self-signup path for the email flow.
--
-- This trigger only fires the auto-provision path for the google
-- provider. For any other provider it does nothing — an external user's
-- `public.users` row must already exist (inserted by the admin invite
-- flow) before their first sign-in, and ON CONFLICT DO NOTHING protects
-- that row from ever being overwritten here.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.raw_app_meta_data->>'provider' = 'google' THEN
    INSERT INTO public.users (email, display_name, tier, is_active)
    VALUES (
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      'internal_standard',
      TRUE
    )
    ON CONFLICT (email) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_auth_user IS
  'Auto-provisions internal_standard users on first Google OAuth sign-in (WBS 1.3.1). '
  'Does nothing for other providers — external users are provisioned ahead of time via '
  'the admin invite flow (WBS 5.2.1), and ON CONFLICT DO NOTHING never overwrites that row.';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Track last_login_at (users table already has the column; nothing wrote
-- to it before now). Fires on every sign-in, not just the first.
CREATE OR REPLACE FUNCTION public.touch_last_login()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.users SET last_login_at = NEW.last_sign_in_at WHERE email = NEW.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.touch_last_login();
