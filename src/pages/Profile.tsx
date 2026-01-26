import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!user || authLoading) return;

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, phone, avatar_url')
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
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user, authLoading]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      })
      .eq('user_id', user.id);

    setSaving(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Nepodařilo se uložit změny',
      });
      return;
    }

    toast({
      title: 'Uloženo',
      description: 'Profil byl úspěšně aktualizován',
    });
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-64 max-w-md mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <User className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Můj profil</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email nelze změnit
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Celé jméno</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jan Novák"
                    />
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

                  <Button onClick={handleSave} className="w-full" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Uložit změny
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
