
import React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import ChildInviteQR from "@/components/auth/ChildInviteQR";
import ProfileImageUpload from "@/components/auth/ProfileImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    // Добавляем перенаправление на главную страницу после выхода
    navigate("/");
  };
  
  return (
    <AppLayout>
      <div className="container max-w-4xl py-6 space-y-6">
        <h1 className="text-2xl font-bold">Профиль</h1>
        
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{currentUser?.name}</CardTitle>
              <CardDescription>
                {currentUser?.role === 'parent' ? 'Родитель' : 'Ребенок'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ProfileImageUpload />
            
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="mt-4"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти из аккаунта
            </Button>
          </CardContent>
        </Card>
        
        {currentUser?.role === 'parent' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Пригласить детей</h2>
            <ChildInviteQR />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
