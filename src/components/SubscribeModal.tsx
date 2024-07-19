"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import useSubscribeModal from "../hooks/useSubscribeModal";
import { useUser } from "../hooks/useUser";
import { postData } from "../libs/helpers";
import {getStripe} from "../libs/stripeClient";
import { Price, ProductWithPrice } from "../types";
import Button from "./Button";
import Modal from "./Modal";

type Props = {
  products: ProductWithPrice[];
};

function formatPrice(price: Price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: 0,
  }).format((price?.unit_amount || 0) / 100);
}

export default function SubscribeModal({ products }: Props) {
  const { isOpen, onClose } = useSubscribeModal();
  const { user, isLoading, subscription } = useUser();
  const [priceIdLoading, setPriceIdLoading] = useState<string>();

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    if (!user) {
      setPriceIdLoading(undefined);
      return toast.error("Must be logged in");
    }
    if (subscription) {
      setPriceIdLoading(undefined);
      return toast("Already subscribed!");
    }
    try {
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price },
      });
      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast.error((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  let content = <div className="text-center">No products avaiable</div>;

  if (products.length) {
    content = (
      <div>
        {products.map((product) => {
          if (!product.prices?.length) {
            return <div key={product.id}>No prices available</div>;
          }
          return product.prices.map((price) => (
            <Button
              onClick={() => handleCheckout(price)}
              key={price.id}
              disabled={isLoading || price.id === priceIdLoading}
              className="mb-4"
            >{`Subscribe for ${formatPrice(price)} a ${
              price.interval
            }`}</Button>
          ));
        })}
      </div>
    );
  }

  if (subscription) {
    content = <div className="text-center">Already subscribed</div>;
  }

  return (
    <Modal
      isOpen={isOpen}
      onChange={onChange}
      title="Only for premium users"
      description="Listen to music with Spotify Premium"
    >
      {content}
    </Modal>
  );
}
