
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import ChildInviteQR from "@/components/auth/ChildInviteQR";
import ProfileImageUpload from "@/components/auth/ProfileImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ProfilePage = () => {
  const { currentUser, logout, updateUserName } = useAuth();
  const navigate = useNavigate();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  
  const handleSaveName = async () => {
    if (name.trim() && currentUser) {
      await updateUserName(name.trim());
      setIsEditingName(false);
      toast.success("Имя успешно обновлено");
    } else {
      toast.error("Имя не может быть пустым");
    }
  };
  
  return (
    <AppLayout>
      <div className="container max-w-4xl py-6 space-y-6">
        <h1 className="text-2xl font-bold">Профиль</h1>
        
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 cursor-pointer" onClick={() => setIsChangingAvatar(!isChangingAvatar)}>
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              {!isChangingAvatar && (
                <button 
                  className="absolute bottom-0 right-0 bg-primary rounded-full p-1"
                  onClick={() => setIsChangingAvatar(true)}
                >
                  <Edit className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="max-w-[200px]"
                    autoFocus
                  />
                  <Button onClick={handleSaveName} size="sm">Сохранить</Button>
                  <Button onClick={() => {
                    setIsEditingName(false);
                    setName(currentUser?.name || "");
                  }} variant="outline" size="sm">Отмена</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CardTitle>{currentUser?.name}</CardTitle>
                  <button onClick={() => setIsEditingName(true)}>
                    <Edit className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              )}
              <CardDescription>
                {currentUser?.role === 'parent' ? 'Родитель' : 'Ребенок'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isChangingAvatar && (
              <div className="mb-4">
                <ProfileImageUpload />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsChangingAvatar(false)}
                  className="mt-2"
                >
                  Отмена
                </Button>
              </div>
            )}
            
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
