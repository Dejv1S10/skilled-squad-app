import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Home, User, LogOut, Briefcase, ClipboardList } from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();
  const { isWorker } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-foreground">HomeHelp</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              {isWorker ? (
                <Button variant="ghost" asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Dashboard
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
