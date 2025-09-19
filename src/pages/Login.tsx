import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Recycle, Globe, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Login = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { t } = useTranslation();
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(loginData.email, loginData.password, selectedRole);
    
    if (success) {
      toast({
        title: t('welcomeBack', 'Welcome back!'),
        description: t('loginSuccess', "You've been successfully logged in."),
      });
      navigate('/');
    } else {
  setError(t('loginError', 'Please check your email and password.'));
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await signup(signupData.email, signupData.password, signupData.name);
    
    if (success) {
      // User will be logged in automatically after email verification
      setSignupData({ name: '', email: '', password: '' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center eco-gradient-subtle p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="eco-gradient p-3 rounded-full">
              <Recycle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-eco-dark">EcoWaste</h1>
          </div>
          <p className="text-muted-foreground">
            {t('loginHeader', 'Join the green revolution - Access for Users & Administrators')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('loginSubHeader', 'Users manage waste & earn credits • Admins oversee the system')}
          </p>
        </div>

        {/* Auth Forms */}
        <Card className="eco-shadow">
          <CardContent className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('login', 'Sign In')}</TabsTrigger>
                <TabsTrigger value="signup">{t('signup', 'Sign Up')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{t('welcomeBack', 'Welcome Back')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t('loginPrompt', 'Enter credentials for User or Admin access')}
                  </p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('email', 'Email')}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t('emailPlaceholder', 'Enter your email')}
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('password', 'Password')}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t('passwordPlaceholder', 'Enter your password')}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Role Selection for Admin Access */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">{t('accessLevel', 'Access Level')}</Label>
                    <RadioGroup 
                      value={selectedRole} 
                      onValueChange={(value) => setSelectedRole(value as 'user' | 'admin')}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="user" id="user" />
                        <Label htmlFor="user" className="flex items-center gap-2 cursor-pointer">
                          <Leaf className="h-4 w-4 text-eco-green" />
                          <span className="text-sm">{t('userAccess', 'User Access')}</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="h-4 w-4 text-eco-warning" />
                          <span className="text-sm">{t('adminAccess', 'Admin Access')}</span>
                        </Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      {selectedRole === 'admin' 
                        ? t('adminAccessDesc', 'Full system administration access')
                        : t('userAccessDesc', 'Standard user features and waste management')
                      }
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full eco-gradient"
                    disabled={isLoading}
                  >
                    {isLoading ? t('signingIn', 'Signing in...') : t('login', 'Sign In')}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{t('createAccount', 'Create Account')}</h2>
                  <p className="text-sm text-muted-foreground">{t('signupPrompt', 'Join the eco-friendly community')}</p>
                </div>
                
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t('fullName', 'Full Name')}</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder={t('fullNamePlaceholder', 'Enter your full name')}
                      value={signupData.name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('email', 'Email')}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t('emailPlaceholder', 'Enter your email')}
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('password', 'Password')}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={t('passwordCreatePlaceholder', 'Create a password')}
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full eco-gradient"
                    disabled={isLoading}
                  >
                    {isLoading ? t('creatingAccount', 'Creating account...') : t('createAccount', 'Create Account')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 rounded-full bg-eco-light">
              <Recycle className="h-5 w-5 text-eco-green" />
            </div>
            <span className="text-xs text-muted-foreground">{t('reportIssues', 'Report Issues')}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 rounded-full bg-eco-light">
              <Leaf className="h-5 w-5 text-eco-green" />
            </div>
            <span className="text-xs text-muted-foreground">{t('earnCredits', 'Earn Credits')}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 rounded-full bg-eco-light">
              <Globe className="h-5 w-5 text-eco-green" />
            </div>
            <span className="text-xs text-muted-foreground">{t('goGreen', 'Go Green')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;