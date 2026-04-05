import { useEffect, useState } from 'react'

interface NewsItem {
  title: string
  date: string
  category: string
  summary: string
  url: string
  source: string
}

export default function News(){
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetch(`${import.meta.env.BASE_URL}data/build/news.json`)
      .then(r => r.ok ? r.json() : [])
      .then(setItems)
      .catch(()=> setItems([]))
      .finally(()=> setLoading(false))
  },[])

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-1">News &amp; Announcements</h1>
      <p className="text-sm text-gray-500 mb-6">
        Latest from the Diocese of Jamaica and the Cayman Islands.{' '}
        <a href="https://www.anglicandioceseja.org/news" target="_blank" rel="noopener noreferrer"
           className="text-[#0A4C8A] underline">Full archive at anglicandioceseja.org</a>
      </p>

      {loading && <p className="text-gray-400">Loading news...</p>}

      {!loading && items.length === 0 && (
        <p className="text-gray-500">No recent news items. Check back soon.</p>
      )}

      <div className="space-y-4">
        {items.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
             className="block border rounded-lg p-4 hover:border-[#0A4C8A] hover:shadow-sm transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium bg-[#0A4C8A] text-white px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  {item.date && (
                    <span className="text-xs text-gray-500">
                      {new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <h2 className="font-semibold text-lg leading-tight mb-1">{item.title}</h2>
                {item.summary && (
                  <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
                )}
              </div>
              <span className="text-gray-400 shrink-0 mt-1">&rarr;</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">{item.source}</div>
          </a>
        ))}
      </div>
    </main>
  )
}
