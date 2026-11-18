import { useTranslation } from "react-i18next";
import {
  MarketingCardGrid,
  MarketingCta,
  MarketingHero,
} from "@/pages/_account/MarketingShell";

type AboutCard = {
  title: string;
  body: string;
  links?: { label: string; href: string }[];
};

/** About — Figma `207:11984`. */
export function AboutPage() {
  const { t } = useTranslation("marketing");
  const cards = t("about.cards", { returnObjects: true }) as AboutCard[];

  return (
    <>
      <MarketingHero
        narrow
        eyebrow={t("about.eyebrow")}
        title={t("about.title")}
        subtitle={t("about.lede")}
      />
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
