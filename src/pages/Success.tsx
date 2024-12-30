import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
          // Create the account
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Processing...</CardTitle>
            <CardDescription>
              Please wait while we complete your registration.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">Registration Error</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full">Try Again</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. Please check your email to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/">
            <Button className="w-full">Continue to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;