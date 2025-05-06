
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

const ChildInviteQR = () => {
  const { generateChildInviteLink } = useAuth();
  const [showQR, setShowQR] = useState(false);
  const inviteLink = generateChildInviteLink();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Ссылка скопирована в буфер обмена");
    } catch (err) {
      console.error("Не удалось скопировать ссылку", err);
      toast.error("Не удалось скопировать ссылку");
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Приглашение в KidBoost",
          text: "Зарегистрируйтесь в KidBoost по этой ссылке",
          url: inviteLink,
        });
        toast.success("Ссылка отправлена");
      } catch (err) {
        console.error("Не удалось поделиться", err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Пригласить ребенка
        </CardTitle>
        <CardDescription>
          Создайте QR-код, чтобы пригласить вашего ребенка присоединиться к приложению
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center">
        {showQR ? (
          <div className="mb-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteLink)}`}
              alt="QR код для регистрации"
              className="border rounded-lg shadow-md"
            />
            
            <div className="mt-4 text-xs text-center text-muted-foreground break-all border p-2 rounded">
              {inviteLink}
            </div>
          </div>
        ) : (
          <Button 
            onClick={() => setShowQR(true)}
            className="w-full mb-4"
          >
            Сгенерировать QR-код
          </Button>
        )}
      </CardContent>
      
      {showQR && (
        <CardFooter className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            Копировать ссылку
          </Button>
          <Button variant="outline" size="sm" onClick={shareLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Поделиться
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ChildInviteQR;
