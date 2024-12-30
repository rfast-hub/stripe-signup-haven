import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const LoadingState = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="text-2xl font-bold">Processing...</CardTitle>
      <CardDescription>
        Please wait while we complete your registration.
      </CardDescription>
    </CardHeader>
  </Card>
);