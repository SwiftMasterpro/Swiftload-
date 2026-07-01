import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const fmtBWP = (n: number) => `P ${Math.round(n).toLocaleString('en-BW')}`
export const fmtKm = (n: number) => `${n.toLocaleString()} km`
export const fmtDate = (d: string) => format(parseISO(d), 'd MMM yyyy')
export const fmtTime = (d: string) => format(parseISO(d), 'HH:mm')
export const fmtDateTime = (d: string) => format(parseISO(d), 'd MMM yyyy HH:mm')
export const fmtAgo = (d: string) => formatDistanceToNow(parseISO(d), { addSuffix: true })
export const fmtTons = (n: number) => `${n} t`
export const fmtPct = (n: number) => `${Math.round(n)}%`
export const fmtPhone = (p: string) => p.startsWith('+267') ? p : `+267 ${p.replace(/^0/,'').replace(/(\d{2})(\d{3})(\d{4})/,'$1 $2 $3')}`
export const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)

export const fmt = {
  currency: fmtBWP,
  distance: (km: number) => (km >= 1000 ? `${(km / 1000).toFixed(km % 1000 === 0 ? 0 : 1)} Mm` : `${km} km`),
  duration: (hours: number) => (hours % 1 === 0 ? `${hours}h` : `${Math.floor(hours)}h 30m`),
  weight: (kg: number) => (kg >= 1000 ? `${(kg / 1000).toFixed(kg % 1000 === 0 ? 0 : 1)}t` : `${kg}kg`),
  initials,
}
