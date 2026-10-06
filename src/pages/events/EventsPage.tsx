import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { EventCard } from "@/components/cards";
import { MapPinIcon } from "@/components/icons";
import { FadeUp, StaggerGroup } from "@/components/motion";
import { Breadcrumbs, NumberedPagination } from "@/components/navigation";
import { MultiSelectDropdown, SearchField } from "@/components/ui";
import { PageSection } from "@/layouts";
import {
  EVENT_CATEGORY_CHIPS,
  LinkedCard,
  slugify,
} from "@/pages/_guest";
import { useGetCitiesQuery } from "@/app/api/accountApis";
import {
  useGetEventCategoriesQuery,
  useGetEventsQuery,
} from "@/app/api/eventsApi";
import { mapCategoryOptions, mapCityOptions } from "@/lib/api/mappers/cities";
import { mapApiEventToCard } from "@/lib/api/mappers/events";
import { buildPageNumbers } from "@/lib/api/unwrap";
import { useEventFavorites } from "@/lib/favorites/useEventFavorites";
import { catalogLabel } from "@/lib/i18n/catalogLabels";
import { cn } from "@/lib/cn";

/**
 * Events directory — matches mobile DiscoveryList:
 * categories dropdown, nearest search, city dropdown, upcoming list.
 * Optional `?free=1` for the free-tickets drill-down.
 */
export function EventsPage() {
  const { t } = useTranslation(["catalog", "nav", "common"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const freeParam = searchParams.get("free");
  const freeOnly =
    freeParam === "1" || freeParam === "true"
      ? true
      : freeParam === "0" || freeParam === "false"
        ? false
        : undefined;

  const [categoryId, setCategoryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [query, setQuery] = useState("");

  const { data: apiCategories } = useGetEventCategoriesQuery();
  const { data: apiCities } = useGetCitiesQuery();
  const { isFavourite, toggleFavourite, canFavourite } = useEventFavorites();

  const categoryOptions = useMemo(
    () =>
      mapCategoryOptions(apiCategories, {
        fallback: EVENT_CATEGORY_CHIPS.filter(
          (label) => label !== "All events",
        ).map((label, index) => ({
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
    data: eventsResult,
    isFetching,
    isError,
  } = useGetEventsQuery({
    page,
    categoryId: categoryId || undefined,
    cityId: cityId || undefined,
    free: freeOnly,
    upcoming: true,
  });
  const apiEvents = eventsResult?.items;
  const pagination = eventsResult?.pagination;

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

  const pageResetSig = `${cityId}\0${categoryId}\0${freeOnly}\0${query}`;
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
    if (eventsResult !== undefined) {
      return (apiEvents ?? []).map(mapApiEventToCard);
    }
    return [];
  }, [apiEvents, eventsResult]);

  // Server ignores `q` — same client filter as the mobile app.
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return catalog;
    return catalog.filter((event) => {
      const hay = `${event.title} ${event.venue}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [catalog, query]);

  const lastPage = Math.max(1, pagination?.lastPage ?? 1);
  const currentPage = Math.min(page, lastPage);
  const pageNumbers = buildPageNumbers(currentPage, lastPage);

  const title =
    freeOnly === true
      ? t("pages.freeTickets", { defaultValue: "Free tickets" })
      : freeOnly === false
        ? t("pages.upcomingEvents", { defaultValue: "Upcoming events" })
        : t("pages.upcomingEvents", { defaultValue: "Upcoming events" });

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
            { label: t("nav:events") },
          ]}
        />
      </PageSection>

      <PageSection padTop={14} padBottom={0}>
        <FadeUp>
          <div className="flex w-full flex-col gap-lg sm:flex-row sm:items-center sm:justify-between">
            <MultiSelectDropdown
              multi={false}
              size="chip"
              label={t("filters.category")}
              allLabel={t("filters.allEvents")}
              placeholder={t("filters.category")}
              options={categoryOptions}
              value={categoryId ? [categoryId] : []}
              onChange={(next) => setCategoryId(next[0] ?? "")}
            />
            <h1 className="text-display-hero text-ink-primary sm:text-center">
              {title}
            </h1>
            <div className="hidden w-[120px] sm:block" aria-hidden />
          </div>
          {statusLine ? (
            <p className="mt-md text-[14px] text-ink-secondary">{statusLine}</p>
          ) : null}
        </FadeUp>

        <div className="mt-xl flex w-full flex-col gap-md">
          <label className="relative block w-full">
            <span className="sr-only">
              {t("filters.searchNear", {
                defaultValue: "Search nearest to you",
              })}
            </span>
            <SearchField
              className="!max-w-none focus-within:!max-w-none"
              placeholder={t("filters.searchNear", {
                defaultValue: "Search nearest to you",
              })}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <MapPinIcon
              size={16}
              className="pointer-events-none absolute end-md top-1/2 -translate-y-1/2 text-ink-brand"
            />
          </label>

          <MultiSelectDropdown
            multi={false}
            size="field"
            className="w-full"
            allLabel={t("filters.anywhereSaudi")}
            placeholder={t("filters.city")}
            options={cityOptions}
            value={cityId ? [cityId] : []}
            onChange={(next) => setCityId(next[0] ?? "")}
          />
        </div>
      </PageSection>

      <PageSection padTop={28} padBottom={64}>
        <StaggerGroup
          className={cn(
            "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {shown.map((event) => (
            <LinkedCard
              key={event.slug ?? event.title}
              to={`/events/${event.slug ?? slugify(event.title)}`}
            >
              <EventCard
                {...event}
                context="catalog"
                favourited={"id" in event ? isFavourite(event.id) : false}
                onToggleFavourite={
                  "id" in event && canFavourite(event.id)
                    ? () => void toggleFavourite(event.id)
                    : undefined
                }
              />
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
