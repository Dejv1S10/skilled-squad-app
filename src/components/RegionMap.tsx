// Klikací mapa krajů ČR. Po kliknutí na kraj se celý vybarví (vybere).
import { useEffect } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import czRegions from '@/data/czRegions.json';

// Data s tvary krajů (zjednodušené hranice + názvy).
const data = czRegions as unknown as GeoJSON.FeatureCollection;

interface Props {
  selected: string[];
  onToggle: (name: string) => void;
}

// Po načtení přizpůsobí výřez tak, aby byla vidět celá ČR.
function FitBounds() {
  const map = useMap();
  useEffect(() => {
    const layer = L.geoJSON(data);
    map.fitBounds(layer.getBounds(), { padding: [8, 8] });
  }, [map]);
  return null;
}

// Vypíše název každého kraje doprostřed jeho plochy.
function RegionLabels() {
  const map = useMap();
  useEffect(() => {
    const labels = data.features.map((f) => {
      const p = f.properties as { name: string; labelLat: number; labelLng: number };
      // Zkrácení pro přehlednost (název kraje, bez slova „kraj").
      const text = p.name.replace('Hlavní město ', '').replace(' kraj', '');
      const tip = L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'region-label',
        interactive: false,
      })
        .setLatLng([p.labelLat, p.labelLng])
        .setContent(text);
      tip.addTo(map);
      return tip;
    });
    return () => labels.forEach((t) => map.removeLayer(t));
  }, [map]);
  return null;
}

export function RegionMap({ selected, onToggle }: Props) {
  // Barva kraje podle toho, jestli je vybraný.
  // Výplň je neprůhledná, aby přes Prahu neprosvítal zelený Středočeský kraj pod ní.
  const styleFor = (name?: string) => ({
    fillColor: name && selected.includes(name) ? '#22c55e' : '#64748b',
    fillOpacity: 1,
    color: '#ffffff',
    weight: 1,
  });

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-lg border bg-muted">
      <MapContainer
        className="h-full w-full bg-muted"
        center={[49.8, 15.5]}
        zoom={7}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <FitBounds />
        <RegionLabels />
        <GeoJSON
          // Změna výběru přepíše klíč → vrstva se překreslí novými barvami.
          key={selected.join('|')}
          data={data}
          style={(feature) => styleFor(feature?.properties?.name)}
          onEachFeature={(feature, layer) => {
            const name = feature.properties?.name as string;
            layer.bindTooltip(name, { sticky: true });
            layer.on({
              click: () => onToggle(name),
              // Zvýraznění při najetí myší (jen silnější okraj, výplň zůstává krytá).
              mouseover: (e) => e.target.setStyle({ weight: 2.5 }),
              mouseout: (e) => e.target.setStyle(styleFor(name)),
            });
            // Kurzor „ruka", ať je jasné, že jde kliknout.
            (layer as L.Path).getElement?.()?.setAttribute('style', 'cursor: pointer');
          }}
        />
      </MapContainer>
    </div>
  );
}
