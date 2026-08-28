import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });
      if (error) throw error;

      // If user is immediately active (email confirmation disabled), redirect
      if (data.session) {
        router.push('/app');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) setError(error.message);
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-destructive', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  if (success) {
    return (
      <>
        <Head><title>Check your email | RagFlow Intelligence</title></Head>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-10 shadow-2xl">
              <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Check your email</h1>
              <p className="text-muted-foreground text-sm">
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and start using RagFlow.
              </p>
              <Link href="/login" className="inline-block mt-6 text-sm text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Sign Up | RagFlow Intelligence</title>
        <meta name="description" content="Create your free RagFlow account and start chatting with your documents." />
      </Head>

      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4 py-12">
        <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <Link href="/">
              <Logo variant="full" className="h-8 cursor-pointer" />
            </Link>
          </div>

          <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
              <p className="text-sm text-muted-foreground mt-1">Start chatting with your documents for free</p>
            </div>

            {/* Google */}
            <button
              type="button"
              id="google-signup-btn"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border/60 bg-background/50 hover:bg-muted/40 text-sm font-medium transition-colors duration-200 mb-5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3 mb-4"
              >
                {error}
              </motion.div>
            )}

            <form id="signup-form" onSubmit={handleSignup} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="signup-name" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/60 border border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="signup-email" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/60 border border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="signup-password" className="text-sm font-medium text-foreground/80 mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background/60 border border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength === 1 ? 'text-destructive' : passwordStrength === 2 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                )}
              </div>

              <button
                id="signup-submit-btn"
                type="submit"
                disabled={loading || !email || !password || !fullName}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-foreground text-background text-sm font-medium rounded-xl hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              By signing up you agree to our{' '}
              <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-foreground font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
