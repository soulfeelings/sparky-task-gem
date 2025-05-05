
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={currentUser?.avatar} alt={currentUser?.name || "User"} />
                <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-medium mt-4">{currentUser?.name}</h2>
              <p className="text-muted-foreground capitalize">{currentUser?.role}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              Log out
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
