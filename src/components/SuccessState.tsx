import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const SuccessState = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
      <CardDescription>
        Thank you for your purchase. We've sent you an email with verification instructions.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-center text-sm text-gray-500">
        Please check your email to verify your account before logging in.
      </p>
      <Button 
        className="w-full"
        onClick={() => window.location.href = 'https://app.cryptotrack.org'}
      >
        Go to Login
      </Button>
    </CardContent>
  </Card>
);