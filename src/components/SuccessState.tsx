import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const SuccessState = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
      <CardDescription>
        Thank you for your purchase. Please check your email to verify your account.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-center text-sm text-gray-500">
        Redirecting you to the app...
      </p>
    </CardContent>
  </Card>
);