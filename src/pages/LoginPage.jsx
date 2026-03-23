import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody, CardFooter, Input, Button, Divider } from "@heroui/react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (signInError) throw signInError;
      navigate("/rooms");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: 'var(--parchment)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(42,24,16,0.02) 2px, rgba(42,24,16,0.02) 4px)', pointerEvents: 'none', opacity: 0.5 }} />
      
      <Card className="w-full max-w-md shadow-lg" style={{ border: '2px solid var(--gold)', background: 'rgba(255,255,255,0.85)' }}>
        <CardHeader className="flex flex-col items-center pb-0 pt-6 px-6">
          <h1 className="font-cinzel text-2xl font-bold text-red-800">Login</h1>
          <p className="text-sm text-default-500 mt-1">Enter your campaign credentials</p>
        </CardHeader>
        <CardBody className="gap-4 px-6 py-4">
          {error && <div className="text-danger text-sm text-center font-bold bg-danger-50 p-2 rounded">{error}</div>}
          
          <Input label="Email" placeholder="Enter your email" value={email} onValueChange={setEmail} isDisabled={loading} />
          <Input label="Password" type="password" placeholder="Enter your password" value={password} onValueChange={setPassword} isDisabled={loading} />

          <Button color="primary" className="w-full mt-2 font-cinzel font-bold" onPress={handleLogin} isLoading={loading}>
            Log In
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}