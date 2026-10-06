import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { useGetCitiesQuery } from "@/app/api/accountApis";
import {
  useGetTalentCategoriesQuery,
  useGetTalentsQuery,
} from "@/app/api/talentsApi";
import { TalentDirectoryCard } from "@/components/cards";
import { FilterChip } from "@/components/data-display";
import { FadeUp, StaggerGroup } from "@/components/motion";
import { NumberedPagination } from "@/components/navigation";
import { MultiSelectDropdown, SearchField } from "@/components/ui";
import { PageSection } from "@/layouts";
import { mapCategoryOptions, mapCityOptions } from "@/lib/api/mappers/cities";
import { mapApiTalentToCard } from "@/lib/api/mappers/talents";
import { buildPageNumbers } from "@/lib/api/unwrap";
import { catalogLabel } from "@/lib/i18n/catalogLabels";
import { LinkedCard, slugify } from "@/pages/_guest";

const TALENT_FALLBACK = [
  "Singers",
  "Bands",
  "DJs",
  "Musicians",
  "Speakers",
  "Comedians",
  "Hosts",
  "Dance troupes",
] as const;

/**
 * Talents directory — mobile only: search by name, talent type, city,
 * highest-rated toggle. API: filters[category], filters[in].
 */
export function TalentsPage() {
  const { t } = useTranslation(["catalog", "common", "nav"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const [categoryId, setCategoryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [query, setQuery] = useState("");
  const [highestRated, setHighestRated] = useState(false);

  const { data: apiCategories } = useGetTalentCategoriesQuery();
  const { data: apiCities } = useGetCitiesQuery();

  const categoryOptions = useMemo(
    () =>
      mapCategoryOptions(apiCategories, {
        fallback: TALENT_FALLBACK.map((label, index) => ({
          value: String(index + 1),
          label,
        })),
      }).map((option) => ({
        ...option,
        label: catalogLabel(t, option.label),
      })),
    [apiCategories, t],
  );

  const cityOptions = useMemo(
    () =>
      mapCityOptions(apiCities).map((city) => ({
        ...city,
        label: catalogLabel(t, city.label),
      })),
    [apiCities, t],
  );

  const {
    data: talentsResult,
    isFetching,
    isError,
  } = useGetTalentsQuery({
    page,
    categoryId: categoryId || undefined,
    cityId: cityId || undefined,
  });
  const apiTalents = talentsResult?.items;
  const pagination = talentsResult?.pagination;

  const setPage = (next: number) => {
    const safe = Math.max(1, next);
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (safe <= 1) params.delete("page");
        else params.set("page", String(safe));
        return params;
      },
      { replace: true },
    );
  };

  const pageResetSig = `${categoryId}\0${cityId}\0${highestRated}\0${query}`;
  const prevPageResetSigRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevPageResetSigRef.current === pageResetSig) return;
    const isFirst = prevPageResetSigRef.current === null;
    prevPageResetSigRef.current = pageResetSig;
    if (isFirst) return;

    setSearchParams(
      (prev) => {
        if (!prev.get("page") || prev.get("page") === "1") return prev;
        const next = new URLSearchParams(prev);
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  }, [pageResetSig]); // eslint-disable-line react-hooks/exhaustive-deps

  const catalog = useMemo(() => {
    if (apiTalents && apiTalents.length > 0) {
      return apiTalents.map(mapApiTalentToCard);
    }
    return [];
  }, [apiTalents]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = catalog;
    if (needle) {
      list = list.filter((talent) => {
        const hay = `${talent.name} ${talent.discipline ?? ""}`.toLowerCase();
        return hay.includes(needle);
      });
    }
    if (highestRated) {
      list = [...list].sort(
        (a, b) => Number.parseFloat(b.rating) - Number.parseFloat(a.rating),
      );
    }
    return list;
  }, [catalog, highestRated, query]);

  const lastPage = Math.max(1, pagination?.lastPage ?? 1);
  const currentPage = Math.min(page, lastPage);
  const pageNumbers = buildPageNumbers(currentPage, lastPage);

  const statusLine = [
    isError ? t("pages.apiPreview") : null,
    isFetching ? t("pages.updating") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageSection padTop={14} padBottom={0}>
        <FadeUp>
          <div className="flex w-full flex-col gap-lg sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-display-hero text-ink-primary">
              {t("nav:talents")}
            </h1>
            <Link
              to="/apply/talent"
              className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-ink-brand hover:text-ink-brand-mid hover:underline"
            >
              {t("pages.performerCta")}
            </Link>
          </div>

          <div className="mt-xl flex w-full flex-col gap-md">
            <SearchField
              className="!max-w-none focus-within:!max-w-none"
              placeholder={t("filters.searchByTalentName", {
                defaultValue: "Search by talent name",
              })}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-[9px]">
              <MultiSelectDropdown
                multi={false}
                size="chip"
                label={t("filters.talentType")}
                allLabel={t("filters.allTalents")}
                placeholder={t("filters.talentType")}
                options={categoryOptions}
                value={categoryId ? [categoryId] : []}
                onChange={(next) => setCategoryId(next[0] ?? "")}
              />
              <MultiSelectDropdown
                multi={false}
                size="chip"
                label={t("filters.city")}
                allLabel={t("filters.anywhereSaudi")}
                placeholder={t("filters.city")}
                options={cityOptions}
                value={cityId ? [cityId] : []}
                onChange={(next) => setCityId(next[0] ?? "")}
              />
              <FilterChip
                selected={highestRated}
                onClick={() => setHighestRated((prev) => !prev)}
              >
                {t("results.sortTopRated")}
              </FilterChip>
            </div>
          </div>
          {statusLine ? (
            <p className="mt-md text-[13px] text-ink-muted">{statusLine}</p>
          ) : null}
        </FadeUp>
      </PageSection>

      <PageSection padTop={28} padBottom={64} id="directory">
        <StaggerGroup className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((talent) => (
            <LinkedCard
              key={talent.slug ?? talent.name}
              to={`/talents/${talent.slug ?? slugify(talent.name)}`}
            >
              <TalentDirectoryCard {...talent} limited />
            </LinkedCard>
          ))}
        </StaggerGroup>
        {lastPage > 1 ? (
          <div className="mt-[36px]">
            <NumberedPagination
              page={currentPage}
              pages={pageNumbers}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </PageSection>
    </>
  );
}
