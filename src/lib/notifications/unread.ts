/**
 * Guest notifications use `is_read` (probe sample). Fallbacks cover older shapes.
 */
export function isUnreadNotification(record: Record<string, unknown>): boolean {
  if (typeof record.is_read === 'boolean') return !record.is_read
  if (typeof record.isRead === 'boolean') return !record.isRead
  if (typeof record.read === 'boolean') return !record.read
  if (typeof record.unread === 'boolean') return record.unread
  if (typeof record.is_unread === 'boolean') return record.is_unread
  if (record.read_at != null && String(record.read_at).trim() !== '') return false
  return false
}

export function countUnreadNotifications(
  notifications: Record<string, unknown>[] | undefined | null,
): number {
  if (!notifications?.length) return 0
  return notifications.filter(isUnreadNotification).length
}
