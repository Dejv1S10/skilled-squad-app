// Mapa s trasou mezi dvěma adresami (Odkud → Kam).
// Adresy převede na souřadnice přes Nominatim (OpenStreetMap),
// trasu spočítá přes OSRM. Vše zdarma, bez účtu.
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';

// Oprava výchozí ikony špendlíku (jinak se v moderním projektu nenačte).
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Point = [number, number]; // [lat, lng]

// Adresu převede na souřadnice (vrátí první nález v ČR).
async function geocode(q: string): Promise<Point | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=cz&accept-language=cs&q=${encodeURIComponent(q)}`,
  );
  const data = await res.json();
  if (!data[0]) return null;
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

// Spočítá trasu autem mezi dvěma body.
async function getRoute(a: Point, b: Point) {
  const res = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`,
  );
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes?.[0]) return null;
  const line: Point[] = data.routes[0].geometry.coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng],
  );
  return { line, distance: data.routes[0].distance as number, duration: data.routes[0].duration as number };
}

// Přizpůsobí výřez tak, aby byla vidět celá trasa.
function FitToRoute({ line }: { line: Point[] }) {
  const map = useMap();
  useEffect(() => {
    if (line.length) map.fitBounds(L.latLngBounds(line), { padding: [30, 30] });
  }, [line, map]);
  return null;
}

interface Props {
  from: string;
  to: string;
}

export function RouteMap({ from, to }: Props) {
  const [start, setStart] = useState<Point | null>(null);
  const [end, setEnd] = useState<Point | null>(null);
  const [line, setLine] = useState<Point[]>([]);
  const [info, setInfo] = useState<{ km: number; min: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Trasu hledáme, až jsou vyplněné obě adresy (s krátkou prodlevou po psaní).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const a = from.trim();
    const b = to.trim();
    if (a.length < 3 || b.length < 3) {
      setLine([]);
      setStart(null);
      setEnd(null);
      setInfo(null);
      setError('');
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const [pa, pb] = await Promise.all([geocode(a), geocode(b)]);
        if (!pa || !pb) {
          setError('Jednu z adres se nepodařilo najít. Zkuste ji upřesnit.');
          setLine([]);
          setLoading(false);
          return;
        }
        setStart(pa);
        setEnd(pb);
        const r = await getRoute(pa, pb);
        if (r) {
          setLine(r.line);
          setInfo({ km: Math.round(r.distance / 100) / 10, min: Math.round(r.duration / 60) });
        } else {
          // Trasu nešlo spočítat — aspoň ukážeme oba body spojené čárou.
          setLine([pa, pb]);
          setInfo(null);
        }
      } catch {
        setError('Trasu se teď nepodařilo načíst.');
        setLine([]);
      }
      setLoading(false);
    }, 700);
  }, [from, to]);

  const hasBoth = from.trim().length >= 3 && to.trim().length >= 3;

  return (
    <div className="space-y-2">
      <div className="relative h-72 w-full overflow-hidden rounded-lg border bg-muted">
        <MapContainer center={[49.8, 15.5]} zoom={7} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {start && <Marker position={start} />}
          {end && <Marker position={end} />}
          {line.length > 0 && <Polyline positions={line} pathOptions={{ color: '#22c55e', weight: 5 }} />}
          <FitToRoute line={line} />
        </MapContainer>

        {/* Překryvné stavy */}
        {loading && (
          <div className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-sm shadow">
            <Loader2 className="h-4 w-4 animate-spin" />
            Hledám trasu…
          </div>
        )}
        {!hasBoth && !loading && (
          <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center">
            <p className="rounded-full bg-background/90 px-4 py-2 text-sm text-muted-foreground shadow">
              Zadejte „Odkud" a „Kam" a zobrazí se trasa.
            </p>
          </div>
        )}
      </div>

      {/* Délka a čas trasy */}
      {info && (
        <p className="text-sm text-muted-foreground">
          Vzdálenost: <span className="font-medium text-foreground">{info.km} km</span> · Odhad jízdy:{' '}
          <span className="font-medium text-foreground">{info.min} min</span>
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
