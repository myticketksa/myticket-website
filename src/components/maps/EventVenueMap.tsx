import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/cn'

const BRAND_GRADIENT =
  'linear-gradient(135deg, var(--color-brand-gradient-start) 0%, var(--color-brand-gradient-mid) 52%, var(--color-brand-gradient-end) 100%)'

const MARKER_CLASS = 'myticket-venue-marker'

function createBrandMarkerIcon() {
  return L.divIcon({
    className: MARKER_CLASS,
    html: `<span style="
      display:block;
      width:28px;
      height:28px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:${BRAND_GRADIENT};
      border:2px solid #fff;
      box-shadow:0 6px 16px color-mix(in srgb, var(--color-brand-gradient-end) 45%, transparent);
    "></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

function readCoord(
  record: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    const value = record[key]
    if (value == null || value === '') continue
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return null
}

export type EventVenueMapProps = {
  latitude: number
  longitude: number
  zoom?: number
  className?: string
  /** Accessible label for the map region. */
  ariaLabel?: string
}

/**
 * Zoomed Leaflet map centered on event coordinates with a brand-gradient pin.
 * Uses imperative Leaflet so the tile layer reliably fills a fixed-height box.
 */
export function EventVenueMap({
  latitude,
  longitude,
  zoom = 15,
  className,
  ariaLabel,
}: EventVenueMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const map = L.map(el, {
      center: [latitude, longitude],
      zoom,
      scrollWheelZoom: false,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    L.marker([latitude, longitude], { icon: createBrandMarkerIcon() }).addTo(
      map,
    )

    // Leaflet needs a second pass after layout/HMR so tiles fill the box.
    const invalidate = () => map.invalidateSize()
    invalidate()
    const raf = requestAnimationFrame(invalidate)
    const timer = window.setTimeout(invalidate, 120)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      map.remove()
    }
  }, [latitude, longitude, zoom])

  return (
    <div
      className={cn('relative size-full overflow-hidden', className)}
      role="img"
      aria-label={ariaLabel}
    >
      <style>{`
        .${MARKER_CLASS} {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          width: 100%;
          height: 100%;
          font: inherit;
        }
      `}</style>
      <div ref={containerRef} className="size-full" />
    </div>
  )
}

export function googleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`
}

export function googleMapsQueryUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** Resolve lat/lng from event detail (top-level or nested place/venue). */
export function parseEventCoordinates(
  record: Record<string, unknown> | undefined | null,
): { latitude: number; longitude: number } | null {
  if (!record || typeof record !== 'object') return null

  const sources: Record<string, unknown>[] = [record]
  for (const key of ['place', 'venue', 'location', 'event'] as const) {
    const nested = record[key]
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      sources.push(nested as Record<string, unknown>)
    }
  }

  for (const source of sources) {
    const latitude = readCoord(source, [
      'latitude',
      'lat',
      'event_latitude',
      'eventLat',
    ])
    const longitude = readCoord(source, [
      'longitude',
      'lng',
      'lon',
      'event_longitude',
      'eventLng',
    ])
    if (latitude == null || longitude == null) continue
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) continue
    return { latitude, longitude }
  }

  return null
}
