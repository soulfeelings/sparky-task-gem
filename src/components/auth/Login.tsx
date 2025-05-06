
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get("parentId");
  const isChildSignup = !!parentId;
  
  const { login, signup } = useAuth();

  useEffect(() => {
    if (isChildSignup) {
      // Автоматически переключаемся на вкладку регистрации если это регистрация ребенка
      document.querySelector('[value="signup"]')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    }
  }, [isChildSignup]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isChildSignup) {
        await signup(signupEmail, signupPassword, signupName, 'child', parentId);
        toast.success("Регистрация успешна! Теперь вы можете войти в систему.");
      } else {
        await signup(signupEmail, signupPassword, signupName);
      }
    } catch (error) {
      console.error("Signup failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Добро пожаловать в KidBoost</CardTitle>
          <CardDescription>
            {isChildSignup 
              ? "Регистрация аккаунта ребенка" 
              : "Управление задачами и наградами для семей"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              {!isChildSignup && <TabsTrigger value="login" disabled={isChildSignup}>Вход</TabsTrigger>}
              <TabsTrigger value="signup">Регистрация</TabsTrigger>
            </TabsList>
            
            {!isChildSignup && (
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="parent@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Вход..." : "Войти"}
                  </Button>
                </form>
              </TabsContent>
            )}
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signupName">
                    {isChildSignup ? "Имя ребенка" : "Ваше имя"}
                  </Label>
                  <Input
                    id="signupName"
                    type="text"
                    placeholder={isChildSignup ? "Имя ребенка" : "Иван Иванов"}
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder={isChildSignup ? "child@example.com" : "parent@example.com"}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Пароль</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                
                {isChildSignup && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
                    Вы регистрируетесь как ребенок и будете привязаны к родительскому аккаунту
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Создание аккаунта..." : isChildSignup 
                    ? "Создать детский аккаунт" 
                    : "Создать аккаунт"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
