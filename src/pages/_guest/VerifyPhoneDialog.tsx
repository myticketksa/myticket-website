import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormDialog } from "@/components/feedback";
import { Button, Field, OTPInput, TextInput } from "@/components/ui";
import { useAccountPhoneRequestMutation, useAccountPhoneVerifyMutation } from "@/app/api/accountApis";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectAuthUser, userUpdated } from "@/features/auth/authSlice";
import { toastPushed } from "@/features/ui/uiSlice";
import { apiErrorMessage } from "@/lib/api/unwrap";
import { localMobile } from "@/pages/auth/PhoneSignInPage";

/**
 * Confirm the account's mobile number with a texted code (16 Nov 2026):
 * tickets for sports events go to a confirmed number. Opened before booking
 * one; `onDone` carries on.
 */
export function VerifyPhoneDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (open: boolean) => void; onDone: () => void }) {
  const { t } = useTranslation("auth");
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const [requestCode, requestState] = useAccountPhoneRequestMutation();
  const [verifyCode, verifyState] = useAccountPhoneVerifyMutation();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [local, setLocal] = useState("");
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (!open) return;
    setStep("phone");
    setCode("");
    setLocal(localMobile(user?.phone ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const phone = `966${local}`;
  const validNumber = /^5\d{8}$/.test(local);
  const busy = requestState.isLoading || verifyState.isLoading;
  const fail = (error: unknown) => dispatch(toastPushed("error", apiErrorMessage(error, t("phone.error"))));

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
      const updated = await verifyCode({ phone, code }).unwrap();
      dispatch(userUpdated({ ...(user ?? {}), ...updated }));
      dispatch(toastPushed("success", t("phone.verifyDone")));
      onOpenChange(false);
      onDone();
    } catch (error) {
      fail(error);
    }
  }

  const button = "mt-[18px] h-[48px] w-full rounded-[24px] text-[15px] font-semibold";

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={step === "phone" ? t("phone.verifyTitle") : t("phone.codeTitle")}
      description={step === "code" ? t("phone.codeSubtitle", { phone: `⁦+966 ${local}⁩` }) : undefined}>
      {step === "phone" ? (
        <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); if (validNumber && !busy) void send(); }}>
          <Field label={t("phone.number")} htmlFor="verify-phone-number"
            error={local.length >= 9 && !validNumber ? t("phone.badNumber") : undefined}>
            <TextInput id="verify-phone-number" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="5XXXXXXXX"
              dir="ltr" className="h-[50px]" value={local} onChange={(e) => setLocal(localMobile(e.target.value))}
              leading={<span dir="ltr" className="font-semibold text-ink-secondary">+966</span>} />
          </Field>
          <Button type="submit" size="lg" loading={requestState.isLoading} disabled={!validNumber} className={button}>
            {t("phone.send")}
          </Button>
        </form>
      ) : (
        <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); if (code.length === 6 && !busy) void verify(); }}>
          <div dir="ltr">
            <OTPInput value={code} onChange={setCode} aria-label={t("phone.codeTitle")} />
          </div>
          <Button type="submit" size="lg" loading={verifyState.isLoading} disabled={code.length < 6} className={button}>
            {t("phone.verify")}
          </Button>
          <div className="mt-[14px] flex items-center justify-between text-[14px] font-medium">
            <button type="button" className="text-ink-secondary" onClick={() => setStep("phone")}>{t("phone.change")}</button>
            {resendIn > 0 ? (
              <span className="text-ink-muted">{t("phone.resendIn", { seconds: resendIn })}</span>
            ) : (
              <button type="button" className="text-ink-brand" disabled={busy} onClick={() => void send()}>{t("phone.resend")}</button>
            )}
          </div>
        </form>
      )}
    </FormDialog>
  );
}
