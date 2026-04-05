import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import MapPanel from '../components/MapPanel'
import ChurchCard from '../components/ChurchCard'
import About from './About'
import Sources from './Sources'
import Glossary from './Glossary'

export default function Home(){
  const [route, setRoute] = useState(location.hash || '#/')
  useEffect(()=>{
    const onHash = ()=> setRoute(location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return ()=> window.removeEventListener('hashchange', onHash)
  },[])

  if(route.startsWith('#/about')) return <About />
  if(route.startsWith('#/sources')) return <Sources />
  if(route.startsWith('#/glossary')) return <Glossary />

  return (
    <div className="grid grid-cols-[300px_1fr] gap-0">
      <aside className="border-r h-[calc(100vh-6.5rem)] sticky top-[4.25rem] overflow-auto">
        <Sidebar />
      </aside>
      <main className="p-0">
        <div className="border-b relative" style={{height:'25vh'}}>
          <MapPanel />
        </div>
        <div className="p-4" style={{minHeight:'50vh'}}>
          <ChurchCard />
        </div>
      </main>
    </div>
  )
}
