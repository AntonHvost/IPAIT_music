"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { BiSearch } from "react-icons/bi";
import { FaUserAlt } from "react-icons/fa";
import { useUser } from "../hooks/useUser";
import { HiHome } from "react-icons/hi";
import { twMerge } from "tailwind-merge";
import usePlayer from "../hooks/usePlayer";
import { Song } from "../types";
import Box from "./Box";
import Library from "./Library";
import SidebarItem from "./SidebarItem";
import Button from "./Button";
import useAuthModal from "../hooks/useAuthModal";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Props = {
  children: React.ReactNode;
  songs: Song[];
};

export default function Sidebar({ children, songs }: Props) {
  const { onOpen } = useAuthModal();
  const player = usePlayer();
  const pathname = usePathname();
  const { activeId } = usePlayer();
  const supabaseClient = useSupabaseClient();
  const { user } = useUser();
  const router = useRouter();
  
  
  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    player.reset();
    router.refresh();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged out!");
    }
  };

  const routes = useMemo(
    () => [
      {
        icon: FaUserAlt,
        label: "Аккаунт",
        active: pathname === "/account",
        href: "/account",
      },
      {
        icon: HiHome,
        label: "Главная",
        active: pathname === "/",
        href: "/",
      },
      {
        icon: BiSearch,
        label: "Поиск",
        active: pathname === "/search",
        href: "/search",
      },
    ],
    [pathname]
  );
  return (
    <div className={twMerge(`flex h-full`, activeId && "h-[calc(100%-80px)]")}>
      <div className="hidden h-full w-[300px] flex-col gap-y-2 bg-oxford_blue p-2 md:flex">
        <Box>
          <div className="flex flex-col gap-y-4 px-5 py-4">
            {routes.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </div>
        </Box>
        <Box className="h-full overflow-y-auto">
          <Library songs={songs} />
        </Box>
      </div>
      <main className="h-full flex-1 overflow-y-auto py-2">{children}</main>
    </div>
  );
}
