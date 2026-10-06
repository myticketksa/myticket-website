import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  useGetExperienceCategoriesQuery,
  useGetExperiencesQuery,
} from "@/app/api/experiencesApi";
import { ExperienceCard } from "@/components/cards";
import { FadeUp, StaggerGroup } from "@/components/motion";
import { Breadcrumbs } from "@/components/navigation";
import { MultiSelectDropdown } from "@/components/ui";
import { PageSection } from "@/layouts";
import { mapCategoryOptions } from "@/lib/api/mappers/cities";
import { mapApiExperienceToCard } from "@/lib/api/mappers/experiences";
import { catalogLabel } from "@/lib/i18n/catalogLabels";
import { LinkedCard, slugify } from "@/pages/_guest";
import { cn } from "@/lib/cn";

const CATEGORY_FALLBACK = [
  "Food & desert",
  "Culture",
  "Heritage",
  "Outdoors",
  "Workshops",
  "Music",
] as const;

const TYPE_TABS = [
  { key: "", labelKey: "filters.any" as const },
  {
    key: "attraction" as const,
    labelKey: "home.attractionsHeading" as const,
  },
  {
    key: "activity" as const,
    labelKey: "home.activitiesHeading" as const,
  },
];

/**
 * Experiences directory — mobile only: type tabs + category dropdown.
 */
export function ExperiencesPage() {
  const { t } = useTranslation(["catalog", "nav", "common"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const experienceType =
    typeParam === "attraction" || typeParam === "activity" ? typeParam : "";

  const { data: apiCategories } = useGetExperienceCategoriesQuery();

  const categoryOptions = useMemo(
    () =>
      mapCategoryOptions(apiCategories, {
        fallback: CATEGORY_FALLBACK.map((label, index) => ({
          value: String(index + 1),
          label,
        })),
      }).map((option) => ({
        ...option,
        label: catalogLabel(t, option.label),
      })),
    [apiCategories, t],
  );

  const [categoryId, setCategoryId] = useState("");

  const {
    data: apiExperiences,
    isFetching,
    isError,
  } = useGetExperiencesQuery({
    categoryId: categoryId || undefined,
    type: experienceType || undefined,
  });

  const catalog = useMemo(() => {
    if (apiExperiences && apiExperiences.length > 0) {
      return apiExperiences.map(mapApiExperienceToCard);
    }
    return [];
  }, [apiExperiences]);

  const setType = (next: string) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (!next) params.delete("type");
        else params.set("type", next);
        return params;
      },
      { replace: true },
    );
  };

  const statusLine = [
    isError ? t("pages.apiPreview") : null,
    isFetching ? t("pages.updating") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageSection padTop={26} padBottom={0}>
        <Breadcrumbs
          items={[
            { label: t("nav:main"), href: "/" },
            { label: t("nav:experiences") },
          ]}
        />
      </PageSection>

      <PageSection padTop={14} padBottom={0}>
        <FadeUp>
          <h1 className="text-display-hero text-ink-primary">
            {t("pages.experiencesTitle")}
          </h1>
          <p className="mt-[10px] max-w-[620px] text-[17px] leading-[1.45] text-ink-secondary">
            {t("pages.experiencesSubtitle")}
          </p>
          {statusLine ? (
            <p className="mt-md text-[14px] text-ink-secondary">{statusLine}</p>
          ) : null}
        </FadeUp>

        <div className="mt-xl flex flex-wrap items-center gap-[9px]">
          {TYPE_TABS.map((tab) => {
            const selected = experienceType === tab.key;
            const label =
              tab.key === ""
                ? t("filters.any", { defaultValue: "All" })
                : t(tab.labelKey, {
                    defaultValue:
                      tab.key === "attraction" ? "Attractions" : "Activities",
                  });
            return (
              <button
                key={tab.key || "all"}
                type="button"
                onClick={() => setType(tab.key)}
                className={cn(
                  "inline-flex min-h-[38px] items-center rounded-full border px-md text-[14px] font-medium",
                  selected
                    ? "border-brand-primary bg-brand-primary/8 text-ink-brand"
                    : "border-border-default bg-surface-default text-ink-primary hover:border-border-brand",
                )}
              >
                {label}
              </button>
            );
          })}
          <MultiSelectDropdown
            multi={false}
            size="chip"
            label={t("filters.category")}
            allLabel={t("filters.allExperiences")}
            placeholder={t("filters.category")}
            options={categoryOptions}
            value={categoryId ? [categoryId] : []}
            onChange={(next) => setCategoryId(next[0] ?? "")}
          />
        </div>
      </PageSection>

      <PageSection padTop={28} padBottom={64}>
        <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {catalog.map((exp) => (
            <LinkedCard
              key={exp.slug ?? exp.title}
              to={`/experiences/${exp.slug ?? slugify(exp.title)}`}
            >
              <ExperienceCard
                context="catalog"
                title={exp.title}
                location={exp.location}
                eyebrow={exp.meta}
                rating={exp.rating}
                guests={exp.guests}
                price={exp.price}
                flag={exp.flag}
                image={exp.image}
              />
            </LinkedCard>
          ))}
        </StaggerGroup>
      </PageSection>
    </>
  );
}
