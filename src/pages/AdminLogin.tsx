import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import deemLogo from "@/assets/deem-logo.jpg";

const AdminLogin = () => {
  const { user, isAdmin, loading, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    setSubmitting(false);

    if (error) {
      toast({
        title: isSignUp ? "Sign Up Failed" : "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (isSignUp) {
      toast({
        title: "Account Created",
        description: "Please check your email to confirm your account, then log in.",
      });
      setIsSignUp(false);
      setPassword("");
      setConfirmPassword("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <img src={deemLogo} alt="Deem" className="h-16 mx-auto" />
          <h1 className="font-display text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">Your account does not have admin privileges. Please contact the system administrator.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
            <Button onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm mx-auto space-y-8 px-4">
        <div className="text-center space-y-2">
          <img
            src={deemLogo}
            alt="Deem Medical Technology"
            className="h-20 mx-auto"
          />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Create a new account" : "Sign in to manage your website"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-primary underline-offset-4 hover:underline font-medium"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
