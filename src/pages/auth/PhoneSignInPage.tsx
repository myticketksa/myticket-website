import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "@/components/icons";
import { Button, Field, OTPInput, TextInput } from "@/components/ui";
import {
  usePhoneCompleteMutation,
  usePhoneRequestMutation,
  usePhoneVerifyMutation,
  type AuthSessionPayload,
} from "@/app/api/authApi";
import { useAppDispatch } from "@/app/hooks";
import { credentialsSet } from "@/features/auth/authSlice";
import { toastPushed } from "@/features/ui/uiSlice";
import { apiErrorMessage } from "@/lib/api/unwrap";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The 9-digit Saudi mobile (5XXXXXXXX) from however it was typed or pasted. */
function localMobile(value: string): string {
  let digits = value
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\D/g, "");
  if (digits.startsWith("00966")) digits = digits.slice(5);
  else if (digits.startsWith("966")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 9);
}

/**
 * Sign in with a Saudi mobile and a texted code (3 Nov 2026): number → code →
 * (a new number only) name and email, the same steps as the app.
 */
export function PhoneSignInPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const dispatch = useAppDispatch();

  const [requestCode, requestState] = usePhoneRequestMutation();
  const [verifyCode, verifyState] = usePhoneVerifyMutation();
  const [completeSignup, completeState] = usePhoneCompleteMutation();

  const [step, setStep] = useState<"phone" | "code" | "profile">("phone");
  const [local, setLocal] = useState("");
  const [code, setCode] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const codeBoxes = useRef<HTMLDivElement>(null);

  // The code boxes take the cursor as soon as they show.
  useEffect(() => {
    if (step === "code") codeBoxes.current?.querySelector("input")?.focus();
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const phone = `966${local}`;
  const validNumber = /^5\d{8}$/.test(local);
  const busy = requestState.isLoading || verifyState.isLoading || completeState.isLoading;
  const fail = (error: unknown) => dispatch(toastPushed("error", apiErrorMessage(error, t("phone.error"))));

  function finish(session: AuthSessionPayload) {
    dispatch(credentialsSet({ token: session.access_token, user: session.user, persist: true }));
    dispatch(toastPushed("success", t("signIn.success")));
    navigate(nextPath.startsWith("/") ? nextPath : "/");
  }

  async function send() {
    try {
      const data = await requestCode({ phone }).unwrap();
      setStep("code");
      setCode("");
      setResendIn(data?.resendIn ?? 60);
    } catch (error) {
      fail(error);
    }
  }

  async function verify() {
    try {
      const data = await verifyCode({ phone, code }).unwrap();
      if ("needsProfile" in data && data.needsProfile) {
        setSignupToken(data.signupToken);
        setStep("profile");
        return;
      }
      finish(data as AuthSessionPayload);
    } catch (error) {
      fail(error);
    }
  }

  async function complete() {
    setAttempted(true);
    if (name.trim().length < 2 || !EMAIL_PATTERN.test(email.trim())) return;
    try {
      finish(await completeSignup({ signupToken, name: name.trim(), email: email.trim() }).unwrap());
    } catch (error) {
      fail(error);
    }
  }

  const title = { phone: t("phone.title"), code: t("phone.codeTitle"), profile: t("phone.profileTitle") }[step];
  const subtitle = {
    phone: t("phone.subtitle"),
    // Kept left-to-right inside Arabic text, or it reads 563… 966+.
    code: t("phone.codeSubtitle", { phone: `\u2066+966 ${local}\u2069` }),
    profile: t("phone.profileSubtitle"),
  }[step];
  const button = "mt-[22px] h-[52px] w-full rounded-[26px] text-[16px] font-semibold";

  return (
    <div className="flex w-full flex-col">
      <h1 className="text-[28px] leading-[1.05] font-extrabold tracking-[-1.47px] text-ink-primary sm:text-[36px] lg:text-[42px]">
        {title}
      </h1>
      <p className="mt-sm text-[15px] leading-[1.4] text-ink-secondary">{subtitle}</p>

      {step === "phone" && (
        <form
          className="mt-[28px] flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (validNumber && !busy) void send();
          }}
        >
          <Field
            label={t("phone.number")}
            htmlFor="phone-number"
            error={local.length >= 9 && !validNumber ? t("phone.badNumber") : undefined}
          >
            <TextInput
              id="phone-number"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="5XXXXXXXX"
              dir="ltr"
              className="h-[50px]"
              value={local}
              onChange={(e) => setLocal(localMobile(e.target.value))}
              leading={<span dir="ltr" className="font-semibold text-ink-secondary">+966</span>}
            />
          </Field>
          <Button type="submit" size="lg" loading={requestState.isLoading} disabled={!validNumber} className={button}>
            {t("phone.send")}
          </Button>
        </form>
      )}

      {step === "code" && (
        <form
          className="mt-[28px] flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 6 && !busy) void verify();
          }}
        >
          <div dir="ltr" ref={codeBoxes}>
            <OTPInput value={code} onChange={setCode} aria-label={t("phone.codeTitle")} />
          </div>
          <Button type="submit" size="lg" loading={verifyState.isLoading} disabled={code.length < 6} className={button}>
            {t("phone.verify")}
          </Button>
          <div className="mt-[18px] flex items-center justify-between text-[14px] font-medium">
            <button type="button" className="text-ink-secondary" onClick={() => setStep("phone")}>
              {t("phone.change")}
            </button>
            {resendIn > 0 ? (
              <span className="text-ink-muted">{t("phone.resendIn", { seconds: resendIn })}</span>
            ) : (
              <button type="button" className="text-ink-brand" disabled={busy} onClick={() => void send()}>
                {t("phone.resend")}
              </button>
            )}
          </div>
        </form>
      )}

      {step === "profile" && (
        <form
          className="mt-[28px] flex flex-col gap-[14px]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy) void complete();
          }}
        >
          <Field label={t("phone.name")} htmlFor="phone-name" error={attempted && name.trim().length < 2 ? t("phone.nameShort") : undefined}>
            <TextInput id="phone-name" autoComplete="name" className="h-[50px]" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field
            label={t("phone.email")}
            htmlFor="phone-email"
            error={attempted && !EMAIL_PATTERN.test(email.trim()) ? t("phone.emailBad") : undefined}
          >
            <TextInput id="phone-email" type="email" autoComplete="email" className="h-[50px]" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" size="lg" loading={completeState.isLoading} className={button}>
            {t("phone.create")}
          </Button>
        </form>
      )}

      <Link
        to={`/sign-in${nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
        className="mt-[26px] flex items-center justify-center gap-[6px] text-[14px] font-medium text-ink-secondary"
      >
        <ArrowLeftIcon size={14} />
        {t("phone.back")}
      </Link>
    </div>
  );
}
