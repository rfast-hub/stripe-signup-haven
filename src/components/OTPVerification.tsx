import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPVerificationProps {
  phone: string;
}

export const OTPVerification = ({ phone }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerifyOTP = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'phone_change',
      });

      if (error) throw error;

      // After successful verification, proceed with checkout
      const { data, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: { phone }
      });

      if (checkoutError) throw checkoutError;
      if (data?.url) window.location.href = data.url;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Verification failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <InputOTP
          value={otp}
          onChange={(value) => setOtp(value)}
          maxLength={6}
          render={({ slots }) => (
            <InputOTPGroup className="gap-2">
              {slots.map((slot, idx) => (
                <InputOTPSlot key={idx} {...slot} index={idx} />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>
      <Button
        onClick={handleVerifyOTP}
        className="w-full"
        disabled={loading || otp.length !== 6}
      >
        {loading ? "Verifying..." : "Verify and continue to payment"}
      </Button>
    </div>
  );
};