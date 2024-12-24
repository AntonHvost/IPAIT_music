"use client"

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import usePlaylistModal from "../hooks/usePlaylistModal";
import uniqid from "uniqid";
import { useUser } from "@/hooks/useUser";
import { toast } from "react-hot-toast";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import { register } from "module";
import { supabase } from "@supabase/auth-ui-shared";

export default function PlaylistModal(){
    const [isLoading, setIsLoading] = useState(false);
    const {isOpen, onClose} = usePlaylistModal();
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const { user } = useUser();

    const {register, handleSubmit, reset} = useForm<FieldValues>({
        defaultValues:{
            name: "",
        },
    });

    const onChange = (open: boolean) => {
        if (!open) {
          reset();
          onClose();
        }
      };

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try{
            setIsLoading(true);
            const imageFile = values.image?.[0];
            if(!imageFile || !user){
                toast.error("Отсутствуют поля");
                return;
            }

            const uniqueID = uniqid();

            const { data: imageData, error: imageError } = await supabaseClient.storage
                .from("playlist_images")
                .upload(`image-${values.name}-${uniqueID}`, imageFile, {
                cacheControl: "3600",
                upsert: false,
            });
      if (imageError) {
        setIsLoading(false);
        return toast.error("Failed image upload.");
      }
        
        const {error: supabaseError} = await supabaseClient
            .from("playlists")
            .insert({
                name: values.name,
                user_id: user.id,
                image_path: imageData.path,
            });
        if (supabaseError) {
        return toast.error(supabaseError.message);
      }
      router.refresh();
      toast.success("Плейлист создан!");
      reset();
      onClose();
        } catch (error){
            toast.error("Something went wrong");
        }
    }    
    return(
        <Modal
            isOpen={isOpen}
            onChange={onChange}
            title="Создать плейлист"
            description="Введите название плейлиста"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                <Input
                    id="name"
                    {...register("title", {required: true})}
                    placeholder="Название плейлиста"
                />
                <div className="pb-1">Select an image</div>
                <Input
                    id="playlist"
                    type="file"
                    disabled={isLoading}
                    accept="image/*"
                    {...register("image", { required: true })}
                />
                <Button disabled={isLoading} type="submit">Создать</Button>
            </form>
        </Modal>
    );
}