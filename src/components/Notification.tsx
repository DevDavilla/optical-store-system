// src/components/Notification.tsx

"use client";

import React, { useEffect, useState } from "react";

interface NotificationProps {
  message: string | null;
  type: "success" | "error" | null;
  onClose: () => void; // Função para fechar a notificação
  duration?: number; // Duração em milissegundos (padrão: 3000ms)
}

export default function Notification({
  message,
  type,
  onClose,
  duration = 3000,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message && type) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose(); // Chama onClose após a duração
      }, duration);

      return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado ou a mensagem mudar
    } else {
      setIsVisible(false);
    }
  }, [message, type, duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const textColor = "text-white";

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center justify-between z-50 transition-transform duration-300 ${bgColor} ${textColor}
            ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            }`}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white font-bold text-lg leading-none"
      >
        &times; {/* Caractere 'x' para fechar */}
      </button>
    </div>
  );
}
