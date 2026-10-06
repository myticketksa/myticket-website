import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  Field,
  FileDropButton,
  Select,
  TextInput,
  Textarea,
  Button,
  MultiSelectDropdown,
} from "@/components/ui";
import { Logo } from "@/components/navigation";
import { PageSection } from "@/layouts";
import { useGetCitiesQuery, useApplyTalentMutation } from "@/app/api/accountApis";
import {
  useGetTalentCategoriesQuery,
} from "@/app/api/talentsApi";
import { useAppDispatch } from "@/app/hooks";
import { toastPushed } from "@/features/ui/uiSlice";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { mapCityOptions, mapCategoryOptions } from "@/lib/api/mappers/cities";
import type { IdLabelOption } from "@/lib/api/formPayload";
import { apiErrorMessage } from "@/lib/api/unwrap";
import { catalogLabel } from "@/lib/i18n/catalogLabels";

const FALLBACK_CATEGORIES: IdLabelOption[] = [
  { value: "1", label: "Singer" },
  { value: "2", label: "Band" },
  { value: "3", label: "DJ" },
  { value: "4", label: "Comedian" },
  { value: "5", label: "Speaker" },
  { value: "6", label: "Dancer" },
  { value: "7", label: "Host" },
  { value: "8", label: "Instrumentalist" },
];

const FALLBACK_CITIES: IdLabelOption[] = [
  { value: "1", label: "Riyadh" },
  { value: "2", label: "Jeddah" },
  { value: "3", label: "Dammam" },
  { value: "4", label: "Khobar" },
];

/**
 * Talent apply — same continuous form as the mobile app (AddTalent):
 * stage name, profile photo, talent type, city, description, portfolio, send.
 */
export function ApplyTalentPage() {
  const { t } = useTranslation(["forms", "common", "nav"]);
  const { t: tCatalog } = useTranslation("catalog");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const authNoticeShown = useRef(false);
  const [applyTalent, applyState] = useApplyTalentMutation();
  const { data: apiCities } = useGetCitiesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: apiCategories } = useGetTalentCategoriesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [stageName, setStageName] = useState("");
  const [biography, setBiography] = useState("");
  const [cityId, setCityId] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<File | undefined>();
  const [portfolioMedia, setPortfolioMedia] = useState<File[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (!authNoticeShown.current) {
        authNoticeShown.current = true;
        dispatch(toastPushed("error", t("forms:loginRequired")));
      }
      requireAuth();
    }
  }, [dispatch, isAuthenticated, requireAuth, t]);

  const categoryOptions = useMemo(
    () => mapCategoryOptions(apiCategories, { fallback: FALLBACK_CATEGORIES }),
    [apiCategories],
  );

  const cityOptions = useMemo(
    () =>
      mapCityOptions(apiCities, FALLBACK_CITIES).map((city) => ({
        ...city,
        label: catalogLabel(tCatalog, city.label),
      })),
    [apiCities, tCatalog],
  );

  useEffect(() => {
    if (!cityId && cityOptions[0]?.value) {
      setCityId(cityOptions[0].value);
    }
  }, [cityId, cityOptions]);

  const canSubmit =
    stageName.trim().length > 1 &&
    categoryIds.length > 0 &&
    Boolean(profilePhoto) &&
    portfolioMedia.length > 0 &&
    Boolean(cityId) &&
    !applyState.isLoading;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || !profilePhoto) return;

    if (!biography.trim()) {
      dispatch(toastPushed("error", t("forms:talent.validation.bio")));
      return;
    }

    const body = new FormData();
    body.append("performer[stageName]", stageName.trim());
    body.append("performer[biography]", biography.trim());
    body.append("performer[homeCity]", cityId);
    body.append("performer[profilePhoto]", profilePhoto);
    for (const file of portfolioMedia) {
      body.append("portfolio[media][]", file);
    }
    for (const categoryId of categoryIds) {
      body.append("categories[performanceCategories][]", categoryId);
    }

    try {
      await applyTalent(body).unwrap();
      dispatch(toastPushed("success", t("forms:talent.success")));
      navigate("/my-tickets");
    } catch (err) {
      dispatch(
        toastPushed("error", apiErrorMessage(err, t("forms:talent.error"))),
      );
    }
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <div className="border-b border-border-default bg-bg-page">
        <div className="mx-auto flex h-[64px] w-full max-w-[var(--container-page)] items-center justify-between gap-md px-page-gutter sm:h-[72px]">
          <Link to="/" className="shrink-0" aria-label={t("nav:home")}>
            <Logo height={34} />
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="shrink-0 text-[13px] font-semibold text-ink-secondary hover:text-ink-brand"
          >
            {t("common:actions.back")}
          </button>
        </div>
      </div>

      <PageSection padTop={28} padBottom={64}>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mx-auto flex w-full max-w-[560px] flex-col gap-lg"
        >
          <h1 className="text-[26px] leading-[1.08] font-extrabold tracking-[-1.2px] text-ink-primary sm:text-[32px]">
            {t("forms:talent.title")}
          </h1>

          <div className="flex flex-col gap-lg rounded-[18px] border border-border-default bg-surface-default p-lg sm:p-[24px]">
            <Field
              label={t("forms:talent.fields.stageName")}
              htmlFor="talent-stage-name"
            >
              <TextInput
                id="talent-stage-name"
                value={stageName}
                onChange={(event) => setStageName(event.target.value)}
                placeholder={t("forms:talent.fields.stageName")}
              />
            </Field>

            <div>
              <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
                {t("forms:talent.fields.profilePhoto")}
              </p>
              <FileDropButton
                label={t("forms:talent.fields.profilePhoto")}
                accept="image/*"
                fileName={profilePhoto?.name}
                onFiles={(files) => setProfilePhoto(files[0])}
              />
            </div>

            <MultiSelectDropdown
              label={t("forms:talent.fields.talentType")}
              placeholder={t("forms:talent.fields.talentType")}
              options={categoryOptions}
              value={categoryIds}
              onChange={setCategoryIds}
              multi
            />

            <Field label={t("forms:talent.fields.city")} htmlFor="talent-city">
              <Select
                id="talent-city"
                value={cityId}
                onChange={(event) => setCityId(event.target.value)}
              >
                {cityOptions.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label={t("forms:talent.fields.bio")}
              htmlFor="talent-bio"
            >
              <Textarea
                id="talent-bio"
                rows={4}
                value={biography}
                onChange={(event) => setBiography(event.target.value)}
                placeholder={t("forms:talent.fields.bio")}
              />
            </Field>

            <div>
              <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
                {t("forms:talent.fields.portfolio")}
              </p>
              {portfolioMedia.length > 0 ? (
                <ul className="mb-[10px] flex flex-col gap-sm">
                  {portfolioMedia.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-md rounded-[12px] border border-border-default bg-bg-page px-md py-sm text-[13px]"
                    >
                      <span className="min-w-0 truncate text-ink-primary">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        className="shrink-0 text-ink-muted hover:text-state-danger"
                        onClick={() =>
                          setPortfolioMedia((list) =>
                            list.filter((_, i) => i !== index),
                          )
                        }
                      >
                        {t("common:actions.remove", { defaultValue: "Remove" })}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <FileDropButton
                label={t("forms:talent.fields.addPortfolio")}
                accept="image/*,video/*"
                multiple
                onFiles={(files) =>
                  setPortfolioMedia((list) => [...list, ...files])
                }
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit}
            loading={applyState.isLoading}
          >
            {t("forms:talent.submit")}
          </Button>
        </form>
      </PageSection>
    </>
  );
}
