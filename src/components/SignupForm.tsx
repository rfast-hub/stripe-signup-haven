import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    const schema = z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

    try {
      schema.parse({ email, password, confirmPassword });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      // Create checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: { email, password }
      });

      if (checkoutError) throw checkoutError;

      // Redirect to Stripe checkout
      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Processing..." : "Sign up"}
      </Button>
    </form>
  );
};