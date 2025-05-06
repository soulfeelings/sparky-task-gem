
import React, { useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { useChildren, Child } from "@/contexts/ChildrenContext";
import { useAuth } from "@/contexts/AuthContext";
import ChildInviteQR from "@/components/auth/ChildInviteQR";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, User, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ChildrenPage = () => {
  const { children, loading, addChild, deleteChild } = useChildren();
  const { currentUser } = useAuth();
  const [showQR, setShowQR] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const navigate = useNavigate();

  // Only parent users should access this page
  if (currentUser?.role !== "parent") {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold">Доступ запрещен</h2>
          <p className="text-muted-foreground mt-2">
            Эта страница доступна только для родителей
          </p>
        </div>
      </AppLayout>
    );
  }

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) {
      toast.error("Пожалуйста, введите имя ребенка");
      return;
    }

    await addChild(newChildName);
    setNewChildName("");
    toast.success(`${newChildName} добавлен в список детей`);
  };

  const handleViewTasks = (child: Child) => {
    navigate(`/tasks/${child.id}`);
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Дети</h1>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить ребенка
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Добавить ребенка</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <form onSubmit={handleAddChild}>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Имя ребенка
                      </label>
                      <input
                        id="name"
                        className="w-full p-2 border rounded"
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                        placeholder="Введите имя ребенка"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Добавить
                    </Button>
                  </div>
                </form>
                
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-lg font-medium mb-2">Пригласить ребенка по QR-коду</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ребенок может зарегистрироваться самостоятельно, отсканировав QR-код
                  </p>
                  <ChildInviteQR />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {loading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : children.length === 0 ? (
          <Card className="border-dashed bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <UserPlus className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Нет добавленных детей</h3>
              <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
                Добавьте ребенка вручную или пригласите по QR-коду
              </p>
              <Button onClick={() => setShowQR(!showQR)}>
                Показать QR-код для приглашения
              </Button>
              {showQR && (
                <div className="mt-4">
                  <ChildInviteQR />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-1">
            {children.map((child) => (
              <Card key={child.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={child.avatar} alt={child.name} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{child.name}</CardTitle>
                    <CardDescription>
                      Добавлен{" "}
                      {new Date(child.created_at).toLocaleDateString("ru-RU")}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleViewTasks(child)}
                    >
                      Задания
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => deleteChild(child.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ChildrenPage;
