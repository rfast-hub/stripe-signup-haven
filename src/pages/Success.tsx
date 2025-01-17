import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { SuccessState } from "@/components/SuccessState";

const Success = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createAccount = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setError("No session ID found");
        setLoading(false);
        return;
      }

      try {
        // First verify the payment
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (verifyError) {
          console.error("Payment verification error:", verifyError);
          throw verifyError;
        }

        if (!verifyData?.success || !verifyData?.email || !verifyData?.password) {
          console.error("Invalid verification data:", verifyData);
          throw new Error("Invalid payment verification data");
        }

        console.log("Payment verified, creating account for:", verifyData.email);
        
        // Create user account with email verification
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: verifyData.email,
          password: verifyData.password,
          options: {
            emailRedirectTo: 'https://app.cryptotrack.org',
            data: {
              payment_verified: true
            }
          }
        });

        if (signUpError) {
          console.error("Signup error:", signUpError);
          throw signUpError;
        }

        if (!signUpData.user) {
          console.error("No user data returned:", signUpData);
          throw new Error("Failed to create user account");
        }

        console.log("Account created successfully:", signUpData.user.id);

        toast({
          title: "Account created",
          description: "Please check your email for verification instructions.",
        });

        // Redirect to app.cryptotrack.org after a short delay
        setTimeout(() => {
          window.location.href = 'https://app.cryptotrack.org';
        }, 3000);
      } catch (err: any) {
        console.error("Error in createAccount:", err);
        setError(err.message);
        toast({
          title: "Error",
          description: err.message || "Failed to create account",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createAccount();
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <SuccessState />
      )}
    </div>
  );
};

export default Success;