import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SignupForm = ({ onVerificationNeeded }: { onVerificationNeeded: (phone: string) => void }) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Ensure we have exactly 10 digits for US numbers
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // If number already includes country code (11 digits starting with 1)
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    return phoneNumber;
  };

  const validateForm = () => {
    const schema = z.object({
      email: z.string().email("Invalid email address"),
      phone: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .refine((val) => {
          const formatted = formatPhoneNumber(val);
          return /^\+1\d{10}$/.test(formatted);
        }, {
          message: "Please enter a valid US phone number (10 digits)",
        }),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

    try {
      schema.parse({ email, phone, password, confirmPassword });
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

    const formattedPhone = formatPhoneNumber(phone);

    try {
      // First create the user with email/password
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        phone: formattedPhone,
        options: {
          data: {
            phone: formattedPhone
          }
        }
      });

      if (signUpError) throw signUpError;

      // Then initiate phone verification
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (otpError) throw otpError;

      onVerificationNeeded(formattedPhone);
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
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
          type="tel"
          placeholder="Phone number (10 digits)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
        {loading ? "Creating account..." : "Continue with verification"}
      </Button>
    </form>
  );
};