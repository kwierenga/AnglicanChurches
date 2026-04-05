import React, { useEffect, useState } from 'react'
import { marked } from 'marked'
import { useQueryState } from '../lib/state'
import type { MediaRow } from '../lib/schemas'

type MediaIndex = Record<string, MediaRow[]>
let _mediaIndex: MediaIndex | null = null
async function getMediaIndex(): Promise<MediaIndex> {
  if(_mediaIndex) return _mediaIndex
  const res = await fetch('/data/build/media-index.json')
  _mediaIndex = res.ok ? await res.json() : {}
  return _mediaIndex!
}

export default function ChurchCard(){
  const [id] = useQueryState('id','')
  const [slug] = useQueryState('slug','')
  const [html, setHtml] = useState<string>('Select a church to see its details. Use the search box or click the map.')
  const [media, setMedia] = useState<MediaRow[]>([])

  useEffect(()=>{
    const s = slug || id
    if(!s){ setHtml('Select a church to see its details.'); setMedia([]); return }
    Promise.all([
      fetch(`/content/churches/${s}.md`).then(r=> r.ok ? r.text() : ''),
      getMediaIndex()
    ]).then(([md, idx])=>{
      setHtml(md ? (marked.parse(md) as string) : 'No page yet.')
      setMedia(idx[s]?.filter(m=>m.type==='image') ?? [])
    })
  },[id, slug])

  const images = media
  return (
    <article className="prose max-w-none">
      {images.length > 0 && (
        <div className="not-prose flex gap-3 overflow-x-auto pb-2 mb-4">
          {images.map((m, i) => (
            <figure key={i} className="shrink-0 m-0">
              <img src={m.url} alt={m.caption} className="h-40 w-auto rounded object-cover" />
              {m.caption && <figcaption className="text-xs text-gray-500 mt-1 max-w-[12rem]">{m.caption}{m.credit ? ` — ${m.credit}` : ''}</figcaption>}
            </figure>
          ))}
        </div>
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{__html: html}} />
    </article>
  )
}
