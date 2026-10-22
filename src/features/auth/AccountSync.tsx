import { useEffect } from 'react'
import { useGetMeQuery } from '@/app/api/accountApis'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAuthToken, userUpdated } from './authSlice'

/**
 * Keeps the signed-in account current: reloaded when the site opens, when the
 * tab comes back into focus, and whenever a page asks (the wallet page does).
 * The balance used to be the one saved at sign-in, so a top-up never showed
 * until the person signed out and in again.
 */
export function AccountSync() {
  const token = useAppSelector(selectAuthToken)
  const dispatch = useAppDispatch()
  const { data } = useGetMeQuery(undefined, { skip: !token, refetchOnFocus: true, refetchOnMountOrArgChange: true })

  useEffect(() => {
    if (data && Object.keys(data).length > 0) dispatch(userUpdated(data))
  }, [data, dispatch])

  return null
}
