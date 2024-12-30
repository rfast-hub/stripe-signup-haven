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
        const { data, error: verifyError } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (verifyError) throw verifyError;

        if (data?.success) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              emailRedirectTo: `${window.location.origin}/success`,
            },
          });

          if (signUpError) throw signUpError;

          toast({
            title: "Account created",
            description: "Please check your email for verification instructions.",
          });
        } else {
          throw new Error("Payment verification failed");
        }
      } catch (err: any) {
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