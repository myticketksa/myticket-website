import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import checkIcon from "@/assets/auth/check-15.svg";
import registerHero from "@/assets/auth/register-hero.png";
import signInHero from "@/assets/auth/sign-in-hero.png";
import { useAppSelector } from "@/app/hooks";
import { Logo } from "@/components/navigation";
import { PageFade } from "@/components/motion";
import { selectIsAuthenticated } from "@/features/auth/authSlice";
import { cn } from "@/lib/cn";

/**
 * Pattern C — AuthLayout. Verified on Sign In `207:11907`.
 *
 * No header, no footer. Split is **702 / 738**, not 50/50. Form column centres a
 * 428-wide auth card (Register uses 452). Reset Password (`207:11297`) is a
 * centred full-bleed form with its own header, so that route skips the split.
 *
 * Default hero matches Sign In; Register swaps imagery and pitch via the path.
 */
export interface AuthLayoutProps {
  hero?: ReactNode;
}

function AuthHeroPanel({
  image,
  headline,
  benefits,
  footer,
}: {
  image: string;
  headline: string;
  benefits: readonly string[];
  footer: string;
}) {
  return (
    <div className="relative flex h-full min-h-dvh flex-col justify-between overflow-hidden px-[48px] py-[44px]">
      <img
        src={image}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[rgba(25,16,8,0.72)] via-[rgba(25,16,8,0.35)] via-[40%] to-[rgba(25,16,8,0.92)]"
      />
      {/* The original (black) lockup on a white tile, so it reads on the dark photo. */}
      <Link to="/" className="relative shrink-0 self-start rounded-[14px] bg-bg-page px-[14px] py-[10px]">
        <Logo height={40} />
      </Link>
      <div className="relative shrink-0">
        <h2 className="max-w-[460px] text-[46px] leading-[1.04] font-extrabold tracking-[-1.61px] text-bg-page">
          {headline}
        </h2>
        {benefits.length > 0 && (
        <ul className="mt-lg flex max-w-[420px] flex-col gap-md">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-[11px]">
              <img
                src={checkIcon}
                alt=""
                className="mt-[3px] size-[15px] shrink-0"
              />
              <span className="text-[15px] leading-[1.5] font-normal text-bg-page">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
        )}
      </div>
      {footer ? <p className="relative shrink-0 text-[13px] text-bg-page">{footer}</p> : <span />}
    </div>
  );
}

export function AuthLayout({ hero }: AuthLayoutProps) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isReset = pathname === "/reset-password";
  const isRegister = pathname === "/register";
  const isAuthEntry = pathname === "/sign-in" || isRegister;

  useEffect(() => {
    if (!isAuthenticated || !isAuthEntry) return;

    const nextPath = new URLSearchParams(search).get("next");
    navigate(nextPath?.startsWith("/") ? nextPath : "/", { replace: true });
  }, [isAuthEntry, isAuthenticated, navigate, search]);

  if (isAuthenticated && isAuthEntry) return null;

  if (isReset) {
    return (
      <div className="flex min-h-dvh w-full flex-col bg-bg-page">
        <PageFade>
          <Outlet />
        </PageFade>
      </div>
    );
  }

  const heroKey = isRegister ? "register" : "signIn";
  // Only true, current claims here — the old list promised cashback, offline
  // QR codes, waitlist alerts and resale that the product doesn't offer, with
  // made-up "people going" counts under it (owner, 26 Oct 2026). Empty now.
  const benefits = t(`hero.${heroKey}.benefits`, {
    returnObjects: true,
    defaultValue: [],
  }) as string[];

  const defaultHero = (
    <AuthHeroPanel
      image={isRegister ? registerHero : signInHero}
      headline={t(`hero.${heroKey}.headline`)}
      benefits={Array.isArray(benefits) ? benefits : []}
      footer={t(`hero.${heroKey}.footer`, { defaultValue: "" })}
    />
  );

  return (
    <div className="flex min-h-dvh w-full bg-bg-page">
      <div className={cn("hidden w-[702px] shrink-0 bg-bg-warm lg:block")}>
        {hero ?? defaultHero}
      </div>
      <div
        className={cn(
          "flex w-full min-w-0 flex-1 items-center justify-center",
          "px-page-gutter py-[40px] sm:py-[56px] lg:w-[738px] lg:flex-none lg:px-[40px]",
        )}
      >
        <div
          className={cn(
            "w-full",
            isRegister ? "max-w-[452px]" : "max-w-[428px]",
          )}
        >
          <PageFade>
            <Outlet />
          </PageFade>
        </div>
      </div>
    </div>
  );
}
