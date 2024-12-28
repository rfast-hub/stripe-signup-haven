import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/SignupForm";
import { OTPVerification } from "@/components/OTPVerification";

const Index = () => {
  const [verificationStep, setVerificationStep] = useState<"initial" | "verify">("initial");
  const [phone, setPhone] = useState("");

  const handleVerificationNeeded = (phoneNumber: string) => {
    setPhone(phoneNumber);
    setVerificationStep("verify");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
          <CardDescription>
            {verificationStep === "initial" 
              ? "Enter your details to create an account"
              : "Enter the verification code sent to your phone"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verificationStep === "initial" ? (
            <SignupForm onVerificationNeeded={handleVerificationNeeded} />
          ) : (
            <OTPVerification phone={phone} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;