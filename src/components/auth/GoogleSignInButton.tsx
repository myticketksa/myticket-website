import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { useFirebaseLoginMutation } from "@/app/api/authApi";
import { useAppDispatch } from "@/app/hooks";
import { credentialsSet } from "@/features/auth/authSlice";
import { toastPushed } from "@/features/ui/uiSlice";
import { googleIdToken } from "@/lib/firebase";

/** Google's four-colour "G", as its brand guidelines ask for on sign-in buttons. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * "Continue with Google" — signs in, or makes the account when there isn't
 * one (Google has already verified the email, so no code step).
 * Same pill as the page's main button, in the outlined style.
 */
export function GoogleSignInButton({ nextPath = "/", persist = true }: { nextPath?: string; persist?: boolean }) {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [firebaseLogin] = useFirebaseLoginMutation();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    try {
      const idToken = await googleIdToken();
      if (!idToken) return;
      const session = await firebaseLogin({ idToken }).unwrap();
      dispatch(credentialsSet({ token: session.access_token, user: session.user, persist }));
      dispatch(toastPushed("success", t("signIn.success")));
      navigate(nextPath.startsWith("/") ? nextPath : "/");
    } catch {
      dispatch(toastPushed("error", t("google.error")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      loading={busy}
      onClick={onClick}
      className="h-[52px] w-full gap-[10px] rounded-[26px] text-[16px] font-semibold"
    >
      <GoogleMark />
      {t("google.continue")}
    </Button>
  );
}

/** The thin "or" line above the Google button. */
export function OrDivider() {
  const { t } = useTranslation("auth");
  return (
    <div className="my-[22px] flex items-center gap-md text-[13px] text-ink-secondary">
      <span className="h-px flex-1 bg-border-default" />
      {t("google.or")}
      <span className="h-px flex-1 bg-border-default" />
    </div>
  );
}
