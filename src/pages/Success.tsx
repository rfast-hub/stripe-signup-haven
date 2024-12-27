import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Success = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. You will receive a confirmation email shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/">
            <Button className="w-full">Return to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;