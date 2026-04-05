import { useEffect, useMemo, useState } from 'react'
import type Fuse from 'fuse.js'
import { useQueryState } from '../lib/state'
import { uniqueValues } from '../lib/utils'
import { loadSearchIndex, getCatalog } from '../lib/search'
import type { ChurchRow } from '../lib/schemas'

export default function Sidebar(){
  const [q, setQ] = useQueryState('q','')
  const [parish, setParish] = useQueryState('parish','')
  const [klass, setKlass] = useQueryState('class','')
  const [status, setStatus] = useQueryState('status','')
  const [, setId] = useQueryState('id','')
  const [, setSlug] = useQueryState('slug','')

  const [catalog, setCatalog] = useState<ChurchRow[]>([])
  const [fuse, setFuse] = useState<Fuse<ChurchRow> | null>(null)

  useEffect(()=>{
    loadSearchIndex().then(f=>{ setFuse(f); setCatalog(getCatalog()) })
  },[])

  const parishes = useMemo(()=> uniqueValues(catalog, 'parish'), [catalog])
  const classes  = useMemo(()=> uniqueValues(catalog, 'classification'), [catalog])
  const statuses = useMemo(()=> uniqueValues(catalog, 'status'), [catalog])

  const results: ChurchRow[] = q.trim() && fuse ? fuse.search(q).slice(0,8).map(r=>r.item) : []

  const filtered = useMemo(()=> catalog.filter(c=>{
    if(parish && c.parish !== parish) return false
    if(klass && c.classification !== klass) return false
    if(status && c.status !== status) return false
    return true
  }),[catalog, parish, klass, status])

  return (
    <div className="p-4 space-y-3">
      <div className="text-xs text-gray-500 font-medium">
        Showing {filtered.length} of {catalog.length} churches
      </div>
      <div className="relative">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search church name"
               className="w-full border rounded px-3 py-2" />
        {results.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-10">
            {results.map((item:any) => (
              <button
                key={item.id}
                onClick={()=>{
                  setId(item.id); setSlug(item.slug)
                  setParish(''); setKlass(''); setStatus('')
                }}
                className="block w-full text-left px-3 py-2 hover:bg-gray-50"
              >
                {item.name} <span className="text-xs text-gray-500">— {item.parish}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <select value={parish} onChange={e=>setParish(e.target.value)} className="w-full border rounded px-3 py-2">
        <option value="">All Parishes</option>
        {parishes.map(p=><option key={p} value={p}>{p}</option>)}
      </select>
      <select value={klass} onChange={e=>setKlass(e.target.value)} className="w-full border rounded px-3 py-2">
        <option value="">All Classifications</option>
        {classes.map(c=><option key={c} value={c}>{c}</option>)}
      </select>
      <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full border rounded px-3 py-2">
        <option value="">All Statuses</option>
        {statuses.map(s=><option key={s} value={s}>{s}</option>)}
      </select>

      <div className="flex gap-2">
        <button onClick={()=>{ setQ(''); setParish(''); setKlass(''); setStatus(''); setId(''); setSlug('') }}
                className="border px-3 py-2 rounded">Clear</button>
        <a className="px-3 py-2 border rounded" href={location.href}>Share link</a>
      </div>
      <p className="text-xs text-gray-600">
        Tip: Pick a parish to zoom. Click Reset on the map to see the whole island.
      </p>
    </div>
  )
}
