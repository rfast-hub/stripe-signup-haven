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
    // Remove all non-digit characters except '+'
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If it already starts with '+', ensure there's only one '+'
    if (cleaned.startsWith('+')) {
      return '+' + cleaned.substring(1).replace(/\+/g, '');
    }
    
    // If no country code ('+') is present, assume US (+1)
    // and ensure number is at least 10 digits
    const digits = cleaned.replace(/\+/g, '');
    if (digits.length >= 10) {
      return `+1${digits.slice(-10)}`;
    }
    
    return cleaned; // Return as is for validation to catch
  };

  const validateForm = () => {
    const schema = z.object({
      email: z.string().email("Invalid email address"),
      phone: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .refine((val) => {
          const formatted = formatPhoneNumber(val);
          // E.164 format validation: +[country code][number]
          return /^\+[1-9]\d{10,14}$/.test(formatted);
        }, {
          message: "Invalid phone number format. Please enter a valid number with country code (e.g., +1234567890)",
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
            phone: formattedPhone // Store phone in user metadata
          }
        }
      });

      if (signUpError) throw signUpError;

      // Then initiate phone verification
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (otpError) {
        if (otpError.message.includes("sms_send_failed")) {
          throw new Error("Failed to send SMS. Please ensure your phone number is in international format (e.g., +1234567890) and try again.");
        }
        throw otpError;
      }

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
          placeholder="Phone number (e.g., +1234567890)"
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