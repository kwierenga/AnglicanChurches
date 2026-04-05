import { useCallback, useSyncExternalStore } from 'react'

const store = {
  subscribe: (cb: ()=>void) => { window.addEventListener('popstate', cb); return ()=>window.removeEventListener('popstate', cb) },
  getSnapshot: () => new URLSearchParams(location.search)
}

export function useQueryState(key: string, initial: string){
  const params = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const value = params.get(key) ?? initial
  const setValue = useCallback((v: string)=>{
    const p = new URLSearchParams(location.search)
    if(v===''||v==null) p.delete(key); else p.set(key, v)
    history.pushState({},'',`?${p.toString()}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  },[key])
  return [value, setValue, params] as const
}
