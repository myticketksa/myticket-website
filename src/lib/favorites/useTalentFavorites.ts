import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  useFavoriteTalentMutation,
  useUnfavoriteTalentMutation,
} from '@/app/api/talentsApi'
import { useAppSelector } from '@/app/hooks'
import { selectIsAuthenticated } from '@/features/auth/authSlice'

const STORAGE_KEY = 'myticket.talent_favorites'

function readIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.map(String))
  } catch {
    return new Set()
  }
}

function writeIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

function isNumericId(value: unknown): value is string | number {
  return value != null && /^\d+$/.test(String(value))
}

/** Talent favourite toggle — API + localStorage mirror (detail payload has no isFavorited). */
export function useTalentFavorites() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [favoriteTalent] = useFavoriteTalentMutation()
  const [unfavoriteTalent] = useUnfavoriteTalentMutation()
  const [savedIds, setSavedIds] = useState<Set<string>>(() => readIds())

  useEffect(() => {
    setSavedIds(readIds())
  }, [])

  const isFavourite = useCallback(
    (talentId: unknown) => {
      if (!isNumericId(talentId)) return false
      return savedIds.has(String(talentId))
    },
    [savedIds],
  )

  const toggleFavourite = useCallback(
    async (talentId: unknown) => {
      if (!isNumericId(talentId)) return false
      if (!isAuthenticated) {
        navigate(`/sign-in?next=${encodeURIComponent(location.pathname + location.search)}`)
        return false
      }
      const id = String(talentId)
      const next = new Set(savedIds)
      const removing = next.has(id)

      try {
        if (removing) {
          await unfavoriteTalent(id).unwrap()
          next.delete(id)
        } else {
          await favoriteTalent(id).unwrap()
          next.add(id)
        }
      } catch (error) {
        // If local state is out of sync with the server, flip the other way once.
        try {
          if (removing) {
            await favoriteTalent(id).unwrap()
            next.add(id)
          } else {
            await unfavoriteTalent(id).unwrap()
            next.delete(id)
          }
        } catch {
          throw error
        }
      }

      writeIds(next)
      setSavedIds(next)
      return true
    },
    [
      favoriteTalent,
      isAuthenticated,
      location.pathname,
      location.search,
      navigate,
      savedIds,
      unfavoriteTalent,
    ],
  )

  return { isFavourite, toggleFavourite, canFavourite: isNumericId }
}
