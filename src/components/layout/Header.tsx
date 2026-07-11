import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Home, User, LogOut, Briefcase, ClipboardList, MapPin, ChevronDown, Sun, Moon, Bot } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { StandaChat } from '@/components/StandaChat';
import { LocationPicker } from '@/components/LocationPicker';

export function Header() {
  const { user, signOut } = useAuth();
  const { isWorker } = useUserRole();
  const navigate = useNavigate();
  const [location, setLocation] = useState('Praha');
  const [locationOpen, setLocationOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const [standaOpen, setStandaOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">Sikula.com</span>
          </Link>

          {/* Kliknutím se otevře okno s mapou a našeptávačem polohy */}
          <Button
            variant="ghost"
            onClick={() => setLocationOpen(true)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span className="max-w-[120px] truncate text-sm">{location}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>

        <nav className="flex items-center gap-4">
          <button
            onClick={() => setStandaOpen(o => !o)}
            className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
          >
            <Bot className="h-4 w-4" />
            <span className="text-sm font-medium">AI asistent Standa</span>
          </button>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Přepnout tmavý režim">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
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
                <Link to="/stat-se-sikulou">Stát se Šikulou</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
    <StandaChat open={standaOpen} onClose={() => setStandaOpen(false)} />
    <LocationPicker
      open={locationOpen}
      onClose={() => setLocationOpen(false)}
      onSelect={(label) => setLocation(label)}
    />
    </>
  );
}
