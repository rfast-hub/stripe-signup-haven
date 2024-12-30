import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const SuccessState = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
      <CardDescription>
        Thank you for your purchase. Please check your email to verify your account.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <a href="https://financesaas.lovable.app/login" className="block">
        <Button className="w-full">Continue to Login</Button>
      </a>
    </CardContent>
  </Card>
);