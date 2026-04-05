import { useEffect, useRef, useState } from 'react'
import type { FeatureCollection, Point } from 'geojson'
import type { MapAdapter, ChurchFeature } from '../adapters/MapAdapter'
import LeafletAdapter from '../adapters/LeafletAdapter'
import ArcGISAdapter from '../adapters/ArcGISAdapter'
import { useQueryState } from '../lib/state'

const AdapterClass = import.meta.env.VITE_MAP_ADAPTER === 'arcgis' ? ArcGISAdapter : LeafletAdapter

export default function MapPanel(){
  const ref = useRef<HTMLDivElement>(null)
  const [adapter, setAdapter] = useState<MapAdapter>()
  const [data, setData] = useState<FeatureCollection<Point, ChurchFeature['properties']> | null>(null)
  const [parish] = useQueryState('parish','')
  const [id] = useQueryState('id','')
  const [klass] = useQueryState('class','')
  const [status] = useQueryState('status','')

  useEffect(()=>{
    const a = new AdapterClass()
    setAdapter(a)
    a.init(ref.current!, { onSelectChurch: (cid)=> {
      const p = new URLSearchParams(location.search); p.set('id', cid)
      history.pushState({},'',`?${p.toString()}`); window.dispatchEvent(new PopStateEvent('popstate'))
    }})
    fetch('/data/build/churches.geo.json').then(r=>r.json()).then(fc=>{
      setData(fc); a.plot(fc)
    })
    return ()=>a.destroy()
  },[])

  useEffect(()=>{
    if(!adapter || !data) return
    if(parish) adapter.fitToParish(parish); else adapter.fitToAll()
  },[parish, adapter, data])

  useEffect(()=>{
    if(!adapter || !data || !id) return
    adapter.flyToChurch(id)
  },[id, adapter, data])

  useEffect(()=>{
    if(!adapter || !data) return
    adapter.setFilter(p=>{
      const okParish = parish ? p.parish===parish : true
      const okClass  = klass ? p.classification===klass : true
      const okStatus = status ? p.status===status : true
      return okParish && okClass && okStatus
    })
  },[parish, klass, status, adapter, data])

  return (
    <>
      <div className="absolute z-10 m-2 flex gap-2">
        <button onClick={()=> adapter?.fitToAll()} className="bg-white/90 border rounded px-2 py-1 text-sm">Reset</button>
        <button onClick={()=> parish ? adapter?.fitToParish(parish) : adapter?.fitToAll()} className="bg-white/90 border rounded px-2 py-1 text-sm">Zoom Parish</button>
      </div>
      <div ref={ref} className="w-full h-full" />
    </>
  )
}
