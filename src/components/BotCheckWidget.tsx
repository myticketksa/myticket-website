import { useEffect, useRef } from "react";

/**
 * "I'm not a robot" before buying a sports ticket (Ministry of Sport rules),
 * with Cloudflare Turnstile. Hands back the token, or null when it lapses or
 * fails. A new `resetSignal` asks again.
 */

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    script.onerror = () => {
      loading = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export function BotCheckWidget({
  siteKey,
  lang,
  onToken,
  resetSignal = 0,
}: {
  siteKey: string;
  lang: "ar" | "en";
  onToken: (token: string | null) => void;
  resetSignal?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const tokenHandler = useRef(onToken);
  tokenHandler.current = onToken;

  useEffect(() => {
    let widgetId: string | null = null;
    let gone = false;
    tokenHandler.current(null);
    loadTurnstile()
      .then((turnstile) => {
        if (gone || !box.current) return;
        widgetId = turnstile.render(box.current, {
          sitekey: siteKey,
          language: lang,
          callback: (token: string) => tokenHandler.current(token),
          "expired-callback": () => tokenHandler.current(null),
          "error-callback": () => tokenHandler.current(null),
        });
      })
      .catch(() => tokenHandler.current(null));
    return () => {
      gone = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey, lang, resetSignal]);

  return <div ref={box} className="mb-lg flex justify-center" />;
}
