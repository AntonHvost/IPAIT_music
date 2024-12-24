import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useUser } from "../hooks/useUser";
import { createPortal } from "react-dom";

type Props = {
    songId: string;
  //onPlayNext: () => void;
  //onAddToPlaylist: () => void;
};

export default function OptionButton({songId}: Props) {
  
    const router = useRouter();
    const { supabaseClient } = useSessionContext();
    const { user } = useUser();
    const [isLiked, setIsLiked] = useState(false);  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const toggleMenu = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom, left: rect.right - 200 }); // Настройка позиции
    setIsMenuOpen((prev) => !prev)
  };

  const handleAddPlaylist = async() => {
    
  }

  const handleLike = async () => {

    if (isLiked) {
      const { error } = await supabaseClient
        .from("liked_songs")
        .delete()
        .eq("user_id", user?.id)
        .eq("song_id", songId);
      if (error) {
        toast.error(error.message);
      } else {
        setIsLiked(false);
      }
    } else {
      const { error } = await supabaseClient.from("liked_songs").insert({
        user_id: user?.id,
        song_id: songId,
      });
      if (error) {
        toast.error(error.message);
      } else {
        setIsLiked(true);
        toast.success("Liked!");
      }
    }
    router.refresh();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);
  
  const menu = (
    <div
      className="absolute z-50 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
        position: "fixed", // Меню теперь не привязано к родительскому элементу
      }}
    >
      <div className="py-1">
      <button
              onClick={() => {
                handleLike();
                //onPlayNext();
                setIsMenuOpen(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Добавить в "Понравившиеся"
            </button>
        <button
          //onClick={onPlayNext}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          Проигрывать далее
        </button>
        <button
          //onClick={onAddToPlaylist}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          Добавить в плейлист
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-2 rounded-full bg-neutral-400/10 hover:bg-neutral-400/20 focus:outline-none"
      >
        ⋮ {/* Иконка или текст, замените на нужное */}
      </button>
      {isMenuOpen && createPortal(menu, document.body)}
    </div>
  );
}