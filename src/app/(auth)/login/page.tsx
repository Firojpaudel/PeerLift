"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("from") || "/dashboard";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    // Attempt login using next-auth credentials provider
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    if (result?.error) {
      console.error(result.error);
      setErrorMsg("Login failed! Please check your credentials and try again.");
      setIsLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-extrabold text-text-primary mb-2">Welcome back</h1>
        <p className="text-text-secondary text-sm">Please enter your details to sign in.</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {errorMsg && (
          <div className="bg-red-50 text-accent-500 text-sm font-medium py-3 px-4 rounded-lg border border-red-100">
            {errorMsg}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
          <Input 
            type="email" 
            placeholder="hello@peerlift.app" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
          <Input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" defaultChecked className="rounded border-border text-primary-500 focus:ring-primary-500" />
            Remember for 30 days
          </label>
          <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">Forgot password?</a>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-4 py-6 text-base" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className="relative mt-6 mb-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-bg-elevated text-text-muted">Or continue with</span>
        </div>
      </div>

      <Button variant="secondary" className="w-full relative py-6">
        <span className="absolute left-6">G</span> {/* Placeholder for Google */}
        Sign in with Google
      </Button>

      <p className="text-center text-sm text-text-secondary mt-8">
        Don&apos;t have an account? <a href="/register" className="font-semibold text-primary-600 hover:text-primary-700">Sign up here</a>
      </p>
    </div>
  )
}
