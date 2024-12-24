/*"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthModal from "../hooks/useAuthModal";
import Modal from "./Modal";

export default function AuthModal() {
  const router = useRouter();
  const { isOpen, onClose } = useAuthModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка авторизации");
      }

      const data = await response.json();

      // Сохранение токена в localStorage
      localStorage.setItem("authToken", data.token);

      // Обновление состояния приложения (например, обновление пользователя)
      router.refresh();
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onChange={onChange}
      title="Добро пожаловать"
      description="Вход в аккаунт"
    >
      <div className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded p-2"
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded p-2"
          disabled={isLoading}
        />
        {errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
          disabled={isLoading}
        >
          {isLoading ? "Вход..." : "Войти"}
        </button>
      </div>
    </Modal>
  );
}
*/

"use client";

import {
  useSessionContext,
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuthModal from "../hooks/useAuthModal";
import Modal from "./Modal";

export default function AuthModal() {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { session } = useSessionContext();
  const { isOpen, onClose } = useAuthModal();

  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
    }
  }, [session, router, onClose]);

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onChange={onChange}
      title="Добро пожаловать"
      description="Вход в аккаунт"
    >
      <Auth
        supabaseClient={supabaseClient}
        providers={["google"]}
        magicLink
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "#404040",
                brandAccent: "#FC8BFD",
              },
            },
          },
        }}
        theme="dark"
      />
    </Modal>
  );
}
