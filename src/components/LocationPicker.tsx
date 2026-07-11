// Okno pro výběr polohy: našeptávač (píšeš -> nabízí místa) + mapa (klikneš -> vybereš).
// Vše zdarma přes OpenStreetMap (mapové dlaždice) a Nominatim (vyhledávání adres).
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Oprava: výchozí ikona špendlíku se v moderních projektech nenačte sama,
// proto jí ručně přiřadíme obrázky z knihovny Leaflet.
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

// Jedno místo z našeptávače / mapy.
interface Place {
  label: string; // text, který uvidí uživatel (např. "Brno, Jihomoravský kraj")
  lat: number;
  lon: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  // Zavolá se, když uživatel polohu potvrdí.
  onSelect: (label: string) => void;
}

// Velikost přiblížení mapy (vyšší číslo = blíž k zemi).
const MAP_ZOOM = 13;

// Po otevření okna přepočítá rozměry mapy (jinak se vykreslí špatně a mimo střed)
// a zarovná vybrané místo přesně doprostřed.
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    // Krátká prodleva, než se okno (dialog) dootevře a mapa zná svou velikost.
    const t = setTimeout(() => {
      map.invalidateSize();
      map.setView(center, MAP_ZOOM, { animate: true });
    }, 150);
    return () => clearTimeout(t);
  }, [center, map]);
  return null;
}

// Zachytí kliknutí do mapy a nahlásí ho nahoru.
function ClickHandler({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ open, onClose, onSelect }: Props) {
  // Výchozí poloha: Praha (souřadnice centra města).
  const PRAHA: Place = { label: 'Praha', lat: 50.0755, lon: 14.4378 };

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  // Základně je vybraná Praha (špendlík rovnou na mapě).
  const [selected, setSelected] = useState<Place | null>(PRAHA);
  // Výchozí pohled mapy: Praha.
  const [center, setCenter] = useState<[number, number]>([PRAHA.lat, PRAHA.lon]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Našeptávač: po každém písmenu (s krátkou prodlevou) zeptáme Nominatim na místa.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&accept-language=cs&countrycodes=cz&q=${encodeURIComponent(q)}`
        );
        const data = await res.json();
        setSuggestions(
          (data as Array<{ display_name: string; lat: string; lon: string }>).map((d) => ({
            label: d.display_name,
            lat: parseFloat(d.lat),
            lon: parseFloat(d.lon),
          }))
        );
      } catch {
        setSuggestions([]);
      }
      setLoading(false);
    }, 350);
  }, [query]);

  // Z bodu na mapě zpětně zjistí adresu (reverzní geokódování).
  const pickFromMap = async (lat: number, lon: number) => {
    setSelected({ label: 'Načítám adresu…', lat, lon });
    setCenter([lat, lon]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=cs&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      setSelected({ label: data.display_name || 'Vybrané místo', lat, lon });
    } catch {
      setSelected({ label: 'Vybrané místo', lat, lon });
    }
  };

  const choose = (place: Place) => {
    setSelected(place);
    setCenter([place.lat, place.lon]);
    setSuggestions([]);
    setQuery(place.label);
  };

  const confirm = () => {
    if (selected) {
      onSelect(selected.label);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Vyberte svoji polohu</DialogTitle>
        </DialogHeader>

        {/* Našeptávací pole */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Zadejte prosím adresu doručení:
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Fantova 26, Praha 6"
              className="h-12 rounded-xl pl-12 text-base"
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}

            {/* Seznam nabídnutých míst */}
            {suggestions.length > 0 && (
              <ul className="absolute z-[1000] mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover shadow-lg">
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => choose(s)}
                      className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="line-clamp-2">{s.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Mapa — kliknutím vyberete přesné místo */}
        <div className="h-[28rem] w-full overflow-hidden rounded-lg border">
          <MapContainer center={center} zoom={MAP_ZOOM} className="h-full w-full" scrollWheelZoom zoomControl={false}>
            {/* Tlačítka +/- dáme dolů vlevo, ať je nepřekrývá našeptávač adresy */}
            <ZoomControl position="bottomleft" />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap center={center} />
            <ClickHandler onPick={pickFromMap} />
            {selected && <Marker position={[selected.lat, selected.lon]} />}
          </MapContainer>
        </div>

        <p className="text-xs text-muted-foreground">
          Tip: klikněte do mapy a vyberte přesné místo, nebo použijte vyhledávání nahoře.
        </p>

        {/* Vybraná poloha + potvrzení */}
        <div className="flex items-center justify-between gap-3">
          <p className="line-clamp-1 flex-1 text-sm">
            {selected ? <span className="font-medium">{selected.label}</span> : 'Zatím nic nevybráno'}
          </p>
          <Button onClick={confirm} disabled={!selected}>
            Potvrdit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
