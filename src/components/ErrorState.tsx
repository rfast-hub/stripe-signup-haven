import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ErrorStateProps {
  error: string;
}

export const ErrorState = ({ error }: ErrorStateProps) => (
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
);