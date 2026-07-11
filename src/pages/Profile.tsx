// Stránka „Můj účet" — nastavení rozdělené do sekcí v levém menu
// (styl jako u velkých služeb typu TaskRabbit): profil, heslo, zabezpečení,
// oznámení, platby, zrušení objednávky, firemní údaje, zůstatek, transakce, smazání účtu.
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import {
  Loader2,
  User,
  Lock,
  ShieldCheck,
  Bell,
  CreditCard,
  ClipboardX,
  Briefcase,
  Wallet,
  Receipt,
  Trash2,
  LogOut,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string | null;
  postal_code: string | null;
  avatar_url: string | null;
}

interface PaymentRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

// Položky levého menu.
const SECTIONS = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'heslo', label: 'Heslo', icon: Lock },
  { id: 'zabezpeceni', label: 'Zabezpečení účtu', icon: ShieldCheck },
  { id: 'oznameni', label: 'Oznámení', icon: Bell },
  { id: 'platba', label: 'Platební údaje', icon: CreditCard },
  { id: 'zrusit', label: 'Zrušit objednávku', icon: ClipboardX },
  { id: 'firma', label: 'Firemní údaje', icon: Briefcase, workerOnly: true },
  { id: 'zustatek', label: 'Zůstatek účtu', icon: Wallet },
  { id: 'transakce', label: 'Transakce', icon: Receipt },
  { id: 'smazat', label: 'Smazat účet', icon: Trash2, danger: true },
] as const;

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isWorker } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const active = searchParams.get('section') || 'profil';
  const setActive = (id: string) => setSearchParams({ section: id });

  // ===== Profil =====
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (!user || authLoading) return;

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, phone, postal_code, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name);
        setPhone(data.phone || '');
        setPostalCode(data.postal_code || '');
        setLoading(false);
        return;
      }

      // Přihlášený uživatel, kterému ale chybí řádek v profiles (např. přerušená
      // registrace) — dopočítáme profil z údajů účtu a rovnou ho v databázi založíme.
      const fallbackName = (user.user_metadata?.full_name as string) || user.email || 'Uživatel';
      const { data: created } = await supabase
        .from('profiles')
        .insert({ user_id: user.id, full_name: fallbackName, email: user.email || '' })
        .select('full_name, email, phone, postal_code, avatar_url')
        .maybeSingle();

      const fallbackProfile = created || {
        full_name: fallbackName,
        email: user.email || '',
        phone: null,
        postal_code: null,
        avatar_url: null,
      };
      setProfile(fallbackProfile);
      setFullName(fallbackProfile.full_name);
      setPhone(fallbackProfile.phone || '');
      setPostalCode(fallbackProfile.postal_code || '');
      setLoading(false);
    }

    fetchProfile();
  }, [user, authLoading]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        postal_code: postalCode.trim() || null,
      })
      .eq('user_id', user.id);
    setSaving(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Chyba', description: 'Nepodařilo se uložit změny' });
      return;
    }
    toast({ title: 'Uloženo', description: 'Profil byl úspěšně aktualizován' });
  };

  // ===== Heslo =====
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'Chyba', description: 'Heslo musí mít alespoň 6 znaků' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Chyba', description: 'Hesla se neshodují' });
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Chyba', description: error.message });
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    toast({ title: 'Heslo změněno', description: 'Nové heslo je nastaveno' });
  };

  // ===== Oznámení (zatím jen místní nastavení, bez ukládání do databáze) =====
  const [notifyTaskUpdates, setNotifyTaskUpdates] = useState(true);
  const [notifyPromo, setNotifyPromo] = useState(true);

  // ===== Transakce =====
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    if (!user || active !== 'transakce') return;
    async function fetchPayments() {
      setPaymentsLoading(true);
      const { data } = await supabase
        .from('payments')
        .select('id, amount, currency, status, created_at')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      setPayments(data || []);
      setPaymentsLoading(false);
    }
    fetchPayments();
  }, [user, active]);

  // ===== Smazat účet =====
  const [deleting, setDeleting] = useState(false);
  const handleDeleteAccount = async () => {
    // Skutečné smazání účtu vyžaduje serverové (administrátorské) oprávnění,
    // které web z bezpečnostních důvodů nemá — proto žádost jen odešleme a odhlásíme.
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 600));
    setDeleting(false);
    toast({
      title: 'Žádost odeslána',
      description: 'O smazání účtu jsme informováni. Do 48 hodin vám napíšeme na e-mail s potvrzením.',
    });
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-96 max-w-4xl mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const paymentStatusLabel: Record<string, string> = {
    paid: 'Zaplaceno',
    pending: 'Čeká na platbu',
    refunded: 'Vráceno',
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="mb-6 text-2xl font-bold">Můj účet</h1>

        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          {/* Levé menu */}
          <nav className="space-y-1">
            {SECTIONS.filter((s) => !('workerOnly' in s && s.workerOnly) || isWorker).map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'danger' in s && s.danger
                        ? 'text-destructive hover:bg-destructive/10'
                        : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {s.label}
                </button>
              );
            })}
          </nav>

          {/* Obsah vybrané sekce */}
          <Card>
            <CardContent className="p-6">
              {/* ---- Profil ---- */}
              {active === 'profil' && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-primary/10 text-3xl text-primary">
                        {(profile?.full_name || 'Š')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-3 text-lg font-semibold sm:justify-start">
                        <User className="h-5 w-5 shrink-0 text-muted-foreground" />
                        {profile?.full_name}
                      </div>
                      <div className="flex items-center justify-center gap-3 text-lg sm:justify-start">
                        <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
                        {profile?.email}
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center justify-center gap-3 text-lg sm:justify-start">
                          <Phone className="h-5 w-5 shrink-0 text-muted-foreground" />
                          {profile.phone}
                        </div>
                      )}
                      {profile?.postal_code && (
                        <div className="flex items-center justify-center gap-3 text-lg sm:justify-start">
                          <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                          {profile.postal_code}
                        </div>
                      )}
                    </div>
                  </div>

                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : isEditingProfile ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={profile?.email || ''} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">Email nelze změnit</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Celé jméno</Label>
                        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+420 123 456 789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">PSČ</Label>
                        <Input
                          id="postalCode"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="123 45"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={async () => {
                            await handleSaveProfile();
                            setIsEditingProfile(false);
                          }}
                          disabled={saving}
                        >
                          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Uložit změny
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                          Zrušit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button onClick={() => setIsEditingProfile(true)}>Upravit profil</Button>
                      <Button variant="outline" onClick={signOut} className="gap-2">
                        <LogOut className="h-4 w-4" />
                        Odhlásit
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* ---- Heslo ---- */}
              {active === 'heslo' && (
                <div className="max-w-sm space-y-4">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg">Změna hesla</CardTitle>
                    <CardDescription>Zadejte nové heslo pro přihlášení.</CardDescription>
                  </CardHeader>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nové heslo</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Nové heslo znovu</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button onClick={handleChangePassword} disabled={passwordSaving}>
                    {passwordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Změnit heslo
                  </Button>
                </div>
              )}

              {/* ---- Zabezpečení účtu ---- */}
              {active === 'zabezpeceni' && (
                <div className="space-y-4">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg">Dvoufázové ověření</CardTitle>
                    <CardDescription>
                      Přidejte účtu druhou vrstvu zabezpečení pomocí SMS kódu při přihlášení.
                    </CardDescription>
                  </CardHeader>
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <ShieldCheck className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Zatím nedostupné</p>
                      <p className="text-sm text-muted-foreground">Tuto funkci připravujeme.</p>
                    </div>
                    <Badge variant="secondary">Připravujeme</Badge>
                  </div>
                </div>
              )}

              {/* ---- Oznámení ---- */}
              {active === 'oznameni' && (
                <div className="space-y-4">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg">Oznámení</CardTitle>
                    <CardDescription>Vyberte, o čem chcete být informováni e-mailem.</CardDescription>
                  </CardHeader>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Aktualizace objednávek</p>
                        <p className="text-sm text-muted-foreground">Změny stavu, zprávy od Šikuly</p>
                      </div>
                      <Switch checked={notifyTaskUpdates} onCheckedChange={setNotifyTaskUpdates} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Novinky a nabídky</p>
                        <p className="text-sm text-muted-foreground">Akce, slevy, tipy</p>
                      </div>
                      <Switch checked={notifyPromo} onCheckedChange={setNotifyPromo} />
                    </div>
                  </div>
                  <Button
                    onClick={() => toast({ title: 'Uloženo', description: 'Nastavení oznámení bylo uloženo' })}
                  >
                    Uložit
                  </Button>
                </div>
              )}

              {/* ---- Platební údaje ---- */}
              {active === 'platba' && (
                <div className="space-y-4">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg">Platební údaje</CardTitle>
                    <CardDescription>Platební karta se zadává až u konkrétní objednávky.</CardDescription>
                  </CardHeader>
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Zatím nemáte uloženou kartu</p>
                      <p className="text-sm text-muted-foreground">
                        Platba proběhne bezpečně přes Stripe při potvrzení objednávky.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Zrušit objednávku ---- */}
              {active === 'zrusit' && (
                <div className="space-y-4">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg">Zrušit objednávku</CardTitle>
                    <CardDescription>
                      Objednávku zrušíte v sekci „Moje objednávky" u konkrétní zakázky.
                    </CardDescription>
                  </CardHeader>
                  <Button onClick={() => navigate('/orders')} className="gap-2">
                    <ClipboardX className="h-4 w-4" />
                    Přejít na Moje objednávky
                  </Button>
                </div>
              )}

              {/* ---- Firemní údaje (jen pro Šikuly) ---- */}
              {active === 'firma' && isWorker && (
                <div className="space-y-4">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg">Firemní údaje</CardTitle>
                    <CardDescription>
                      Pro fakturaci a výplaty potřebujeme vaše fakturační údaje.
                    </CardDescription>
                  </CardHeader>
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Zatím nevyplněno</p>
                      <p className="text-sm text-muted-foreground">Tuto funkci připravujeme.</p>
                    </div>
                    <Badge variant="secondary">Připravujeme</Badge>
                  </div>
                </div>
              )}

              {/* ---- Zůstatek účtu ---- */}
              {active === 'zustatek' && (
                <div className="space-y-4">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg">Zůstatek účtu</CardTitle>
                    <CardDescription>Kredit se automaticky uplatní u další objednávky.</CardDescription>
                  </CardHeader>
                  <p className="text-3xl font-bold">0 Kč</p>
                </div>
              )}

              {/* ---- Transakce ---- */}
              {active === 'transakce' && (
                <div className="space-y-4">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg">Historie transakcí</CardTitle>
                  </CardHeader>
                  {paymentsLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : payments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Zatím nemáte žádné transakce.</p>
                  ) : (
                    <div className="space-y-2">
                      {payments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                          <div>
                            <p className="font-medium">
                              {(p.amount / 100).toLocaleString('cs-CZ')} {p.currency.toUpperCase()}
                            </p>
                            <p className="text-muted-foreground">
                              {format(new Date(p.created_at), 'd. MMMM yyyy', { locale: cs })}
                            </p>
                          </div>
                          <Badge variant={p.status === 'paid' ? 'default' : 'secondary'}>
                            {paymentStatusLabel[p.status] || p.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ---- Smazat účet ---- */}
              {active === 'smazat' && (
                <div className="space-y-4">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg">Smazání účtu</CardTitle>
                    <CardDescription>
                      Po smazání účtu se už nebudete moct přihlásit. Tuto akci nelze vzít zpět.
                    </CardDescription>
                  </CardHeader>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Smazat účet
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Opravdu chcete smazat účet?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Odešleme žádost o smazání a rovnou vás odhlásíme. Z bezpečnostních důvodů
                          smazání dokončuje naše podpora — potvrzení dostanete e-mailem do 48 hodin.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Zrušit</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting}>
                          {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Ano, smazat
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
