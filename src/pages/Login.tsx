import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, LogIn, UserPlus, Eye, EyeOff, Loader2 } from "lucide-react";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!nome.trim() || !email.trim() || !password.trim()) {
          setError("Preencha todos os campos obrigatórios.");
          setLoading(false);
          return;
        }
        const res = await register({ nome, email, password, cargo });
        if (res.success) navigate("/");
        else setError(res.error || "Erro ao registar.");
      } else {
        if (!email.trim() || !password.trim()) {
          setError("Preencha todos os campos.");
          setLoading(false);
          return;
        }
        const res = await login(email, password);
        if (res.success) navigate("/");
        else setError(res.error || "Erro ao entrar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20">
            <Info className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">+ INFO</span>
            <p className="text-xs text-muted-foreground">Data CoLAB</p>
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">{isRegister ? "Criar Conta" : "Entrar"}</CardTitle>
            <CardDescription>
              {isRegister
                ? "Preencha os dados para criar a sua conta"
                : "Introduza as suas credenciais para aceder ao portal"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="O seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Gestor de Stock" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {isRegister ? "Criar Conta" : "Entrar"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(""); }}
                className="text-sm text-primary hover:underline"
              >
                {isRegister ? "Já tem conta? Entrar" : "Não tem conta? Criar conta"}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Autenticação segura — dados persistentes na cloud
        </p>
      </div>
    </div>
  );
};

export default Login;
