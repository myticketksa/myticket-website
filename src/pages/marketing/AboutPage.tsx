import { useTranslation } from "react-i18next";
import {
  MarketingCardGrid,
  MarketingCta,
  MarketingHero,
  MarketingStats,
} from "@/pages/_account/MarketingShell";

type AboutStat = { value: string; label: string };
type AboutCard = {
  title: string;
  body: string;
  links?: { label: string; href: string }[];
};

/** About — Figma `207:11984`. */
export function AboutPage() {
  const { t } = useTranslation("marketing");
  const stats = t("about.stats", { returnObjects: true }) as AboutStat[];
  const cards = t("about.cards", { returnObjects: true }) as AboutCard[];

  return (
    <>
      <MarketingHero
        narrow
        eyebrow={t("about.eyebrow")}
        title={t("about.title")}
        subtitle={t("about.lede")}
      />
      <MarketingStats stats={Array.isArray(stats) ? stats : []} />
      <MarketingCardGrid
        items={(Array.isArray(cards) ? cards : []).map((card) => ({
          title: card.title,
          body: <p>{card.body}</p>,
          links: card.links,
        }))}
      />
      <MarketingCta
        text={t("about.ctaText")}
        buttonLabel={t("about.ctaLabel")}
        buttonTo="/events"
      />
    </>
  );
}
