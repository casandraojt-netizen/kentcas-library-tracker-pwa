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

export const PHYSICAL_GENRES = ['Fantasy','Science Fiction','Mystery','Thriller','Romance','Historical Fiction','Literary Fiction','Horror','Adventure','Non-Fiction','Biography','Self-Help','Science','Philosophy','Poetry','Graphic Novel','Manga','Other']

export const WEB_GENRES = ['Xianxia','Wuxia','Cultivation','LitRPG','Progression Fantasy','Isekai','Reincarnation','System','Dungeon','Slice of Life','Romance','Action','Adventure','Sci-Fi','Fantasy','Horror','Comedy','Manhwa','Manga','Web Novel','Other']

export function getStatuses(collection) {
  return collection === 'physical' ? PHYSICAL_STATUSES : WEB_STATUSES
}

export function getGenres(collection) {
  return collection === 'physical' ? PHYSICAL_GENRES : WEB_GENRES
}
