// src/adapters/LeafletAdapter.ts
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapAdapter, ChurchFeature } from './MapAdapter'
import type { FeatureCollection, Point } from 'geojson'

export default class LeafletAdapter implements MapAdapter {
  private map!: L.Map
  private layer!: L.GeoJSON
  private data!: FeatureCollection<Point, ChurchFeature['properties']>
  private onSelect?: (id: string)=>void

  init(el: HTMLElement, opts?: { onSelectChurch?: (id: string)=>void }) {
    this.onSelect = opts?.onSelectChurch
    this.map = L.map(el, { attributionControl: true }).setView([18.1,-77.3], 8)

    // ---- Dev tiles: NO esri-leaflet-vector, NO maplibre ----
    // Esri World Imagery (no API key)
    // @ts-ignore
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(this.map)
    // Reference labels (no API key)
    // @ts-ignore
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{
      maxZoom: 19, opacity: 0.9
    }).addTo(this.map)
  }

  plot(fc: FeatureCollection<Point, ChurchFeature['properties']>) {
    this.data = fc
    if(this.layer) this.layer.remove()
    this.layer = L.geoJSON(fc, {
      pointToLayer: (_f, latlng) => L.circleMarker(latlng, { radius: 5 }),
      onEachFeature: (f, layer) => {
        layer.on('click', () => this.onSelect?.(f.properties!.id))
        layer.bindTooltip(f.properties!.name)
      }
    }).addTo(this.map)
    this.fitToAll()
  }

  fitToAll(){ if(!this.layer) return; this.map.fitBounds(this.layer.getBounds(), { padding:[20,20] }) }

  fitToParish(parish: string){
    const pts: L.LatLngExpression[] = []
    this.data.features.forEach(f => {
      if(f.properties!.parish.toLowerCase()===parish.toLowerCase())
        pts.push([f.geometry.coordinates[1], f.geometry.coordinates[0]])
    })
    if(pts.length) this.map.fitBounds(L.latLngBounds(pts), { padding:[20,20] })
  }

  flyToChurch(id: string){
    const f = this.data.features.find(x=>x.properties!.id===id)
    if(!f) return
    this.map.flyTo([f.geometry.coordinates[1], f.geometry.coordinates[0]], 16)
  }

  setFilter(fn: (p: ChurchFeature['properties']) => boolean){
    const filtered = { ...this.data, features: this.data.features.filter(f=>fn(f.properties!)) }
    this.plot(filtered as any)
  }

  destroy(){ this.map?.remove() }
}
