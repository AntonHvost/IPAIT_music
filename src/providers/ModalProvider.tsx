"use client";

import { useEffect, useState } from "react";
import AuthModal from "../components/AuthModal";
import SubscribeModal from "../components/SubscribeModal";
import UploadModal from "../components/UploadModal";
import PlaylistModal from "../components/PlaylistModal";
import { ProductWithPrice } from "../types";

type Props = {
  products: ProductWithPrice[];
};

export default function ModalProvider({ products }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AuthModal />
      <UploadModal />
      <PlaylistModal/>
      <SubscribeModal products={products} />
    </>
  );
}
