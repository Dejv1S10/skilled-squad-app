import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Home, User, LogOut, Briefcase, ClipboardList, MapPin, ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

export function Header() {
  const { user, signOut } = useAuth();
  const { isWorker } = useUserRole();
  const navigate = useNavigate();
  const [location, setLocation] = useState('Praha');
  const [isLocating, setIsLocating] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await response.json();
          const city = data.address?.city || data.address?.town || data.address?.village || 'Aktuální poloha';
          setLocation(city);
        } catch {
          setLocation('Aktuální poloha');
        }
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      }
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">HomeHelp</span>
          </Link>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="max-w-[120px] truncate text-sm">{location}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Vaše poloha</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Zadejte město nebo adresu"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                >
                  <MapPin className="h-4 w-4" />
                  {isLocating ? 'Zjišťuji polohu...' : 'Použít aktuální polohu'}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              {isWorker ? (
                <Button variant="ghost" asChild>
                  <Link to="/partner" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Partner Dashboard
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" asChild>
                  <Link to="/orders" className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Moje objednávky
                  </Link>
                </Button>
              )}
              <Button variant="ghost" asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profil
                </Link>
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Odhlásit
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Přihlásit</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Registrace</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
