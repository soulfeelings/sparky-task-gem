
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/components/auth/Login";
import ParentDashboard from "@/pages/ParentDashboard";
import ChildDashboard from "@/pages/ChildDashboard";

const Index = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, show the login screen
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            KidBoost
          </h1>
          <p className="text-muted-foreground mt-2">
            Task and reward management for families
          </p>
        </div>
        
        <Login />
      </div>
    );
  }

  // If user is logged in, show the appropriate dashboard
  return currentUser.role === "parent" ? <ParentDashboard /> : <ChildDashboard />;
};

export default Index;
