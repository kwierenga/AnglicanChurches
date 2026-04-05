export function uniqueValues<T extends Record<string, any>>(rows: T[], key: keyof T){
  const s = new Set<string>()
  rows.forEach(r=> s.add(String(r[key] ?? '')))
  return Array.from(s).filter(Boolean).sort((a,b)=>a.localeCompare(b))
}
