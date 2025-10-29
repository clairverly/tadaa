import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const navigate = useNavigate();

  const handleSkipLogin = () => {
    // Skip authentication and go directly to dashboard
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to Tadaa</CardTitle>
          <CardDescription className="text-center">
            Authentication is temporarily disabled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Google OAuth login is being configured.</p>
            <p className="mt-2">Click below to access the app without authentication.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            onClick={handleSkipLogin}
            className="w-full"
          >
            Continue to App
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            To enable Google login, follow the setup guide in GOOGLE_OAUTH_QUICK_START.md
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}