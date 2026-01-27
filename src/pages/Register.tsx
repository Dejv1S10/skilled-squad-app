import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase, User } from 'lucide-react';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Jméno musí mít alespoň 2 znaky').max(100),
  email: z.string().trim().email('Neplatný email').max(255),
  password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
});

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isWorker, setIsWorker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = registerSchema.safeParse({ fullName, email, password });
    if (!validation.success) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: validation.error.errors[0].message,
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, isWorker);
    setLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Registrace selhala',
        description: error.message,
      });
      return;
    }

    toast({
      title: 'Úspěch!',
      description: 'Účet byl úspěšně vytvořen',
    });
    navigate('/');
  };

  return (
    <Layout>
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Registrace</CardTitle>
            <CardDescription>
              Vytvořte si nový účet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Celé jméno</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jan Novák"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vas@email.cz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Heslo</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isWorker ? (
                      <Briefcase className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <Label htmlFor="worker-toggle" className="cursor-pointer">
                        Chci nabízet služby
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {isWorker ? 'Registrace jako pracovník' : 'Registrace jako zákazník'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="worker-toggle"
                    checked={isWorker}
                    onCheckedChange={setIsWorker}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Vytvořit účet
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Už máte účet? </span>
              <Link to="/login" className="font-medium text-primary hover:underline">
                Přihlaste se
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
