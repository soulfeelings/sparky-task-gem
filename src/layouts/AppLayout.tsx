
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Bell, Home, LogOut, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { currentUser, logout, users, switchAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isParent = currentUser?.role === "parent";
  const currentTab = location.pathname === "/" 
    ? "home" 
    : location.pathname.substring(1);

  const handleTabChange = (value: string) => {
    if (value === "home") {
      navigate("/");
    } else {
      navigate(`/${value}`);
    }
  };

  const otherUsers = users.filter(u => u.id !== currentUser?.id);

  return (
    <div className="flex flex-col min-h-full max-w-lg mx-auto bg-background">
      {/* Header */}
      <header className="border-b p-4 flex items-center justify-between">
        <div className="flex-1 flex items-center">
          <h1 className="text-xl font-medium">
            {isParent ? "Parent Dashboard" : "My Tasks & Rewards"}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full w-10 h-10 p-0">
                <Avatar>
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name || "User"} />
                  <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.role}</p>
              </div>
              
              {/* Switch accounts (demo only) */}
              {otherUsers.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Switch account
                  </div>
                  {otherUsers.map(user => (
                    <DropdownMenuItem 
                      key={user.id}
                      onClick={() => {
                        switchAccount(user.id);
                        navigate("/");
                      }}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground capitalize">
                        {user.role}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <div className="h-px bg-border mx-2 my-1"></div>
                </>
              )}
              
              {/* Logout */}
              <DropdownMenuItem 
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-destructive"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <footer className="border-t p-2">
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="home">
              <Home size={18} className="mr-2" />
              Home
            </TabsTrigger>
            
            {isParent ? (
              <TabsTrigger value="children">
                <User size={18} className="mr-2" />
                Children
              </TabsTrigger>
            ) : (
              <TabsTrigger value="rewards">
                <Award size={18} className="mr-2" />
                Rewards
              </TabsTrigger>
            )}
            
            {isParent ? (
              <TabsTrigger value="tasks">
                <Bell size={18} className="mr-2" />
                Tasks
              </TabsTrigger>
            ) : (
              <TabsTrigger value="profile">
                <User size={18} className="mr-2" />
                Profile
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </footer>
    </div>
  );
};

export default AppLayout;
