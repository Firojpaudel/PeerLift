"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Registration failed");
        setIsLoading(false);
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setErrorMsg("An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-[32px] font-display font-extrabold text-text-primary mb-2">Join PeerLift</h1>
        <p className="text-text-secondary text-sm">Start trading skills with passionate learners today.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-accent-500 text-sm font-medium py-3 px-4 rounded-lg border border-red-100">
          {errorMsg}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Full Name</label>
            <Input 
              type="text" 
              placeholder="Jane Doe" 
              required 
              className="h-11 rounded-lg border-border"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Username</label>
            <Input 
              type="text" 
              placeholder="janedoe" 
              required 
              className="h-11 rounded-lg border-border"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Email</label>
          <Input 
            type="email" 
            placeholder="you@example.com" 
            required 
            className="h-11 rounded-lg border-border" 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Password</label>
          <Input 
            type="password" 
            placeholder="Create a strong password" 
            required 
            className="h-11 rounded-lg border-border" 
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <Button type="submit" variant="primary" disabled={isLoading} className="w-full mt-4 py-6 font-semibold bg-primary-500 rounded-lg text-base">
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="relative mt-2 mb-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-bg-primary text-text-muted">Or sign up with</span>
        </div>
      </div>

      <button type="button" className="w-full flex items-center justify-center gap-3 bg-bg-elevated border border-primary-300 text-primary-600 font-semibold rounded-lg h-12 transition-colors hover:bg-bg-secondary relative">
         <span className="absolute left-6 text-primary-500 font-bold">G</span>
         <span>Google</span>
      </button>

      <p className="text-center text-sm text-text-secondary mt-2">
        Already have an account? <a href="/login" className="font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2">Sign in</a>
      </p>
    </div>
  )
}
