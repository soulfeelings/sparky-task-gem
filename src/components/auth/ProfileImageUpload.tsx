
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ProfileImageUpload = () => {
  const { currentUser, updateUserAvatar } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;
    
    await uploadAndUpdateAvatar(file);
  };

  const uploadAndUpdateAvatar = async (file: File) => {
    if (!currentUser) return;

    setIsUploading(true);
    try {
      // Генерируем уникальное имя файла с идентификатором пользователя
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Загружаем файл в хранилище
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Получаем публичный URL файла
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      if (data) {
        // Обновляем аватар пользователя в таблице profiles и локальном состоянии
        const success = await updateUserAvatar(data.publicUrl);
        
        if (success) {
          toast.success("Аватар успешно обновлен");
        } else {
          toast.error("Не удалось обновить аватар в базе данных");
        }
      }
    } catch (error: any) {
      console.error("Ошибка при загрузке файла:", error);
      toast.error(error.message || "Ошибка при загрузке изображения");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = async () => {
    try {
      // Запрашиваем доступ к камере
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Создаем временный элемент видео и canvas для снимка
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Создаем диалог для снимка
      const dialog = document.createElement('dialog');
      dialog.classList.add('fixed', 'inset-0', 'flex', 'flex-col', 'items-center', 'justify-center', 'bg-black', 'bg-opacity-50', 'z-50');
      
      const contentDiv = document.createElement('div');
      contentDiv.classList.add('bg-white', 'p-4', 'rounded-lg', 'max-w-md', 'w-full');
      
      const videoElement = document.createElement('video');
      videoElement.classList.add('w-full', 'h-64', 'object-cover', 'mb-4');
      videoElement.autoplay = true;
      videoElement.srcObject = stream;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('flex', 'justify-center', 'gap-4');
      
      const captureButton = document.createElement('button');
      captureButton.textContent = "Сделать снимок";
      captureButton.classList.add('px-4', 'py-2', 'bg-primary', 'text-white', 'rounded');
      
      const cancelButton = document.createElement('button');
      cancelButton.textContent = "Отмена";
      cancelButton.classList.add('px-4', 'py-2', 'bg-gray-500', 'text-white', 'rounded');
      
      buttonContainer.appendChild(captureButton);
      buttonContainer.appendChild(cancelButton);
      
      contentDiv.appendChild(videoElement);
      contentDiv.appendChild(buttonContainer);
      dialog.appendChild(contentDiv);
      
      document.body.appendChild(dialog);
      dialog.showModal();
      
      cancelButton.onclick = () => {
        dialog.close();
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(dialog);
      };
      
      captureButton.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext('2d')?.drawImage(videoElement, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
            await uploadAndUpdateAvatar(file);
            
            dialog.close();
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(dialog);
          }
        }, 'image/jpeg');
      };
      
    } catch (error) {
      console.error("Ошибка доступа к камере:", error);
      toast.error("Не удалось получить доступ к камере");
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleGalleryClick}
          disabled={isUploading}
          className="flex-1"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Галерея
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCameraClick}
          disabled={isUploading}
          className="flex-1"
        >
          <Camera className="mr-2 h-4 w-4" />
          Камера
        </Button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
      
      {isUploading && <p className="text-sm text-center text-muted-foreground">Загрузка изображения...</p>}
    </div>
  );
};

export default ProfileImageUpload;
