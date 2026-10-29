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

/** Ask the list for a full 4×3 grid. `perPage` is ignored today and the list returns 10. */
const TALENT_SERVER_PAGE_SIZE = 12;
/** 3 columns × 3 rows. Used when the API page size is not a multiple of 3. */
const TALENT_CLIENT_PAGE_SIZE = 9;
/** Observed list size when `perPage` is ignored. */
const TALENT_API_PAGE_SIZE = 10;


/**
 * Which API pages hold one 9-card directory page when each API page has 10.
 * Page 2 starts on the 10th card of API page 1 so no talent is dropped.
 */
function talentClientWindow(uiPage: number) {
  const start = (Math.max(1, uiPage) - 1) * TALENT_CLIENT_PAGE_SIZE;
  const first = Math.floor(start / TALENT_API_PAGE_SIZE) + 1;
  const last =
    Math.floor((start + TALENT_CLIENT_PAGE_SIZE - 1) / TALENT_API_PAGE_SIZE) + 1;
  return { first, last, offset: start % TALENT_API_PAGE_SIZE };
}

/**
 * Talents directory — mobile only: search by name, talent type, city,
 * highest-rated toggle. API: filters[category], filters[in].
 */
/** Same logos and order as the app's talents hub (talentSponsors), colour versions. */
const SPONSORS = [
  { src: "/sponsors/ministry-of-media.svg", name: "Ministry of Media" },
  { src: "/sponsors/vision-2030.png", name: "Saudi Vision 2030" },
  { src: "/sponsors/public-transport-authority.png", name: "Public Transport Authority" },
  { src: "/sponsors/human-rights-commission.svg", name: "Human Rights Commission" },
  { src: "/sponsors/ministry-of-culture.svg", name: "Ministry of Culture" },
  { src: "/sponsors/tourism-national-heritage.svg", name: "Saudi Commission for Tourism and National Heritage" },
  { src: "/sponsors/general-entertainment-authority.svg", name: "General Entertainment Authority" },
  { src: "/sponsors/ministry-of-sport.png", name: "Ministry of Sport" },
];

export function TalentsPage() {
  const { t } = useTranslation(["catalog", "common", "nav"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const [categoryId, setCategoryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [query, setQuery] = useState("");
  const [highestRated, setHighestRated] = useState(false);
  /** True once a response page size divides evenly into the 3-column grid. */
  const [serverPageFillsRows, setServerPageFillsRows] = useState(false);

  const { data: apiCategories } = useGetTalentCategoriesQuery();
  const { data: apiCities } = useGetCitiesQuery();

  const categoryOptions = useMemo(
    () =>
      // No invented categories: the fallback list had made-up ids (1–8) that
      // filtered on the wrong thing.
      mapCategoryOptions(apiCategories).map((option) => ({
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

  const listFilters = {
    perPage: TALENT_SERVER_PAGE_SIZE,
    categoryId: categoryId || undefined,
    cityId: cityId || undefined,
  };
  const clientWindow = talentClientWindow(page);
  const requestedPage = serverPageFillsRows ? page : clientWindow.first;
  const needsSecondPage =
    !serverPageFillsRows && clientWindow.last !== clientWindow.first;

  // `currentData` is only ever the answer for the page asked for. `data` keeps
  // the previous request's rows while a new page loads, and slicing those with
  // the new page's offset put the wrong talents on screen for a moment.
  const {
    currentData: talentsResult,
    data: lastTalentsResult,
    isFetching: primaryFetching,
    isError: primaryError,
  } = useGetTalentsQuery({
    ...listFilters,
    page: requestedPage,
  });
  const {
    currentData: overflowResult,
    isFetching: overflowFetching,
    isError: overflowError,
  } = useGetTalentsQuery(
    {
      ...listFilters,
      page: clientWindow.last,
    },
    { skip: !needsSecondPage },
  );

  const responsePerPage = talentsResult?.pagination.perPage ?? 0;
  const responseFillsRows = responsePerPage > 0 && responsePerPage % 3 === 0;
  useEffect(() => {
    if (responseFillsRows) setServerPageFillsRows(true);
  }, [responseFillsRows]);

  const serverPageReady = responseFillsRows && requestedPage === page;
  const clientPageReady =
    !responseFillsRows &&
    Boolean(talentsResult) &&
    (!needsSecondPage || Boolean(overflowResult) || overflowError);

  const pageTalents = useMemo(
    () =>
      serverPageReady
        ? talentsResult?.items
        : clientPageReady
          ? [
              ...(talentsResult?.items ?? []),
              ...(needsSecondPage ? (overflowResult?.items ?? []) : []),
            ].slice(
              clientWindow.offset,
              clientWindow.offset + TALENT_CLIENT_PAGE_SIZE,
            )
          : undefined,
    [
      serverPageReady,
      clientPageReady,
      talentsResult,
      overflowResult,
      needsSecondPage,
      clientWindow.offset,
    ],
  );
  // The last complete page stays on screen until the next one is whole, so
  // the grid neither empties nor mixes two pages while it loads.
  const [heldTalents, setHeldTalents] = useState(pageTalents);
  useEffect(() => {
    if (pageTalents) setHeldTalents(pageTalents);
  }, [pageTalents]);
  const apiTalents = pageTalents ?? heldTalents;
  const pagination = (talentsResult ?? lastTalentsResult)?.pagination;
  const isFetching = primaryFetching || (needsSecondPage && overflowFetching);
  const isError = primaryError || (needsSecondPage && overflowError);

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

  const lastPage = serverPageReady
    ? Math.max(1, pagination?.lastPage ?? 1)
    : Math.max(
        1,
        Math.ceil((pagination?.total ?? 0) / TALENT_CLIENT_PAGE_SIZE) || 1,
      );
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
        <FadeUp inView={false}>
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

      {/* The ministries and authorities shown on the app's talents hub, in colour. */}
      <PageSection padTop={0} padBottom={72}>
        <h2 className="mb-lg text-[20px] font-bold text-ink-primary">{t("partners.title")}</h2>
        <ul className="flex flex-wrap items-center justify-center gap-x-[40px] gap-y-[28px] rounded-[18px] border border-border-default bg-white px-lg py-[28px]">
          {SPONSORS.map((sponsor) => (
            <li key={sponsor.src}>
              <img src={sponsor.src} alt={sponsor.name} loading="lazy" className="h-[64px] w-auto max-w-[170px] object-contain" />
            </li>
          ))}
        </ul>
      </PageSection>
    </>
  );
}
