"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Button from "../../../components/Button";
import useSubscribeModal from "../../../hooks/useSubscribeModal";
import { useUser } from "../../../hooks/useUser";
import { postData } from "../../../libs/helpers";

export default function AccountContent() {
  const router = useRouter();
  const { onOpen } = useSubscribeModal();
  const { isLoading, subscription, user } = useUser();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, router, user]);

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    try {
      const { url } = await postData({ url: "/api/create-portal-link" });
      window.location.assign(url);
    } catch (error) {
      if (error) {
        toast.error((error as Error).message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="mb-7 px-6">
      {!subscription && (
        <div className="flex flex-col gap-y-4">
          <p>Нет активного плана.</p>
          <Button onClick={onOpen} className="w-[300px]">
            Подписаться
          </Button>
        </div>
      )}
      {subscription && (
        <div className="flex flex-col gap-y-4">
          <p>
            You are currently on the{" "}
            <b>{subscription.prices?.products?.name}</b> plan.
          </p>
          <Button
            disabled={loading || isLoading}
            onClick={redirectToCustomerPortal}
            className="w-[300px]"
          >
            Не работает XD
          </Button>
        </div>
      )}
    </div>
  );
}
