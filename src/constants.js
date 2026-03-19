export const PHYSICAL_STATUSES = [
  { value: 'reading', label: 'Reading', color: '#c9873a' },
  { value: 'finished', label: 'Finished', color: '#5a9a6e' },
  { value: 'unread', label: 'Unread', color: '#6b5f52' },
  { value: 'dropped', label: 'Dropped', color: '#9a4040' },
]

export const WEB_STATUSES = [
  { value: 'reading', label: 'Reading', color: '#c9873a' },
  { value: 'finished', label: 'Finished', color: '#5a9a6e' },
  { value: 'unread', label: 'Unread', color: '#6b5f52' },
  { value: 'dropped', label: 'Dropped', color: '#9a4040' },
  { value: 'waiting', label: 'Waiting', color: '#4a7a9a' },
  { value: 'abandoned', label: 'Abandoned', color: '#8a5030' },
  { value: 'hiatus', label: 'Hiatus', color: '#7a6a3a' },
]

export function getStatuses(collection) {
  return collection === 'physical' ? PHYSICAL_STATUSES : WEB_STATUSES
}
