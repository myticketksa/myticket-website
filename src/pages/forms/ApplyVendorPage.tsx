import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { isValidCommercialRegistration } from "@/lib/validation/fieldFormats";
import {
  Field,
  FileDropButton,
  TextInput,
  Textarea,
  Button,
  MultiSelectDropdown,
} from "@/components/ui";
import { Logo } from "@/components/navigation";
import { PageSection } from "@/layouts";
import { useGetCitiesQuery, useApplyVendorMutation } from "@/app/api/accountApis";
import { useAppDispatch } from "@/app/hooks";
import { toastPushed } from "@/features/ui/uiSlice";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { mapCityOptions } from "@/lib/api/mappers/cities";
import type { IdLabelOption } from "@/lib/api/formPayload";
import { apiErrorMessage } from "@/lib/api/unwrap";
import { catalogLabel } from "@/lib/i18n/catalogLabels";

const FALLBACK_CITIES: IdLabelOption[] = [
  { value: "1", label: "Riyadh" },
  { value: "2", label: "Jeddah" },
  { value: "4", label: "Dammam" },
  { value: "9", label: "Khobar" },
];

/** City centroids — same stand-in as the mobile app for `business[latitude/longitude]`. */
const CITY_CENTROIDS: Record<string, { latitude: number; longitude: number }> =
  {
    "1": { latitude: 24.7136, longitude: 46.6753 },
    "2": { latitude: 21.5433, longitude: 39.1728 },
    "3": { latitude: 26.61, longitude: 37.92 },
    "4": { latitude: 26.4207, longitude: 50.0888 },
    "5": { latitude: 24.734, longitude: 46.5765 },
    "7": { latitude: 21.3891, longitude: 39.8579 },
    "8": { latitude: 24.5247, longitude: 39.5692 },
    "9": { latitude: 26.2794, longitude: 50.2083 },
    "10": { latitude: 26.2361, longitude: 50.0393 },
    "11": { latitude: 21.2854, longitude: 40.4183 },
    "12": { latitude: 28.3838, longitude: 36.555 },
    "13": { latitude: 18.2465, longitude: 42.5117 },
    "14": { latitude: 27.0046, longitude: 49.6598 },
    "15": { latitude: 24.0895, longitude: 38.0618 },
    "16": { latitude: 17.4924, longitude: 44.1277 },
    "17": { latitude: 27.5219, longitude: 41.6907 },
    "18": { latitude: 16.8892, longitude: 42.5611 },
    "19": { latitude: 26.326, longitude: 43.975 },
    "20": { latitude: 18.3, longitude: 42.7333 },
    "21": { latitude: 25.3833, longitude: 49.5867 },
    "22": { latitude: 26.5651, longitude: 49.9969 },
    "23": { latitude: 28.4341, longitude: 47.7962 },
  };

const DEFAULT_CENTROID = CITY_CENTROIDS["1"]!;

/**
 * Facilities apply — same continuous form as the mobile app (AddOrganization):
 * trade name, CR, city dropdown, service, address, logo, personal photo, send.
 */
export function ApplyVendorPage() {
  const { t } = useTranslation(["forms", "common", "nav"]);
  const { t: tCatalog } = useTranslation("catalog");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const authNoticeShown = useRef(false);
  const [applyVendor, applyState] = useApplyVendorMutation();
  const { data: apiCities } = useGetCitiesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [tradeName, setTradeName] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [cityId, setCityId] = useState("");
  const [address, setAddress] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [logo, setLogo] = useState<File | undefined>();
  const [personalPhoto, setPersonalPhoto] = useState<File | undefined>();

  useEffect(() => {
    if (!isAuthenticated) {
      if (!authNoticeShown.current) {
        authNoticeShown.current = true;
        dispatch(toastPushed("error", t("forms:loginRequired")));
      }
      requireAuth();
    }
  }, [dispatch, isAuthenticated, requireAuth, t]);

  const cityOptions = useMemo(
    () =>
      mapCityOptions(apiCities, FALLBACK_CITIES).map((city) => ({
        ...city,
        label: catalogLabel(tCatalog, city.label),
      })),
    [apiCities, tCatalog],
  );

  const canSubmit =
    tradeName.trim().length > 1 &&
    crNumber.trim().length > 0 &&
    Boolean(cityId) &&
    serviceName.trim().length > 0 &&
    serviceDescription.trim().length > 0 &&
    address.trim().length > 0 &&
    Boolean(logo) &&
    Boolean(personalPhoto) &&
    !applyState.isLoading;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || !logo || !personalPhoto) return;

    if (!isValidCommercialRegistration(crNumber)) {
      dispatch(toastPushed("error", t("forms:vendor.validation.crFormat")));
      return;
    }

    const centroid = CITY_CENTROIDS[cityId] ?? DEFAULT_CENTROID;
    const body = new FormData();
    body.append("business[tradeName]", tradeName.trim());
    body.append("business[CRnumber]", crNumber.trim());
    body.append("business[primaryCity]", cityId);
    body.append("business[address]", address.trim());
    body.append("business[latitude]", String(centroid.latitude));
    body.append("business[longitude]", String(centroid.longitude));
    body.append("business[logo]", logo);
    body.append("business[personalPhoto]", personalPhoto);
    body.append("service[name]", serviceName.trim());
    body.append("service[description]", serviceDescription.trim());

    try {
      await applyVendor(body).unwrap();
      dispatch(toastPushed("success", t("forms:vendor.success")));
      navigate("/my-tickets");
    } catch (err) {
      dispatch(
        toastPushed("error", apiErrorMessage(err, t("forms:vendor.error"))),
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
          <div>
            <h1 className="text-[26px] leading-[1.08] font-extrabold tracking-[-1.2px] text-ink-primary sm:text-[32px]">
              {t("forms:vendor.title")}
            </h1>
            <p className="mt-sm text-[15px] text-ink-secondary">
              {t("forms:vendor.notice")}
            </p>
          </div>

          <div className="flex flex-col gap-lg rounded-[18px] border border-border-default bg-surface-default p-lg sm:p-[24px]">
            <Field
              label={t("forms:vendor.fields.businessName")}
              htmlFor="vendor-trade-name"
            >
              <TextInput
                id="vendor-trade-name"
                value={tradeName}
                onChange={(event) => setTradeName(event.target.value)}
                placeholder={t("forms:vendor.fields.businessName")}
              />
            </Field>

            <Field label={t("forms:vendor.fields.cr")} htmlFor="vendor-cr">
              <TextInput
                id="vendor-cr"
                inputMode="numeric"
                value={crNumber}
                onChange={(event) => setCrNumber(event.target.value)}
                placeholder={t("forms:vendor.fields.cr")}
              />
            </Field>

            <MultiSelectDropdown
              multi={false}
              label={t("forms:vendor.fields.city")}
              placeholder={t("forms:vendor.fields.city")}
              options={cityOptions}
              value={cityId ? [cityId] : []}
              onChange={(next) => setCityId(next[0] ?? "")}
            />

            <Field
              label={t("forms:vendor.fields.serviceName")}
              htmlFor="vendor-service-name"
            >
              <TextInput
                id="vendor-service-name"
                value={serviceName}
                onChange={(event) => setServiceName(event.target.value)}
                placeholder={t("forms:vendor.fields.serviceName")}
              />
            </Field>

            <Field
              label={t("forms:vendor.fields.serviceDescription")}
              htmlFor="vendor-service-description"
            >
              <Textarea
                id="vendor-service-description"
                rows={4}
                value={serviceDescription}
                onChange={(event) => setServiceDescription(event.target.value)}
                placeholder={t("forms:vendor.fields.serviceDescription")}
              />
            </Field>

            <Field
              label={t("forms:vendor.fields.address")}
              htmlFor="vendor-address"
            >
              <TextInput
                id="vendor-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder={t("forms:vendor.fields.address")}
              />
            </Field>

            <div>
              <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
                {t("forms:vendor.fields.logoTitle")}
              </p>
              <FileDropButton
                label={t("forms:vendor.fields.logoUpload")}
                accept="image/*"
                fileName={logo?.name}
                onFiles={(files) => setLogo(files[0])}
              />
            </div>

            <div>
              <p className="mb-[7px] text-[13px] font-semibold text-ink-primary">
                {t("forms:vendor.fields.personalPhotoTitle")}
              </p>
              <FileDropButton
                label={t("forms:vendor.fields.personalPhotoUpload")}
                accept="image/*"
                fileName={personalPhoto?.name}
                onFiles={(files) => setPersonalPhoto(files[0])}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit}
            loading={applyState.isLoading}
          >
            {t("forms:vendor.submit")}
          </Button>
        </form>
      </PageSection>
    </>
  );
}
