"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import uniqid from "uniqid";
import useUploadModal from "../hooks/useUploadModal";
import { useUser } from "../hooks/useUser";
import Button from "./Button";
import Input from "./Input";
import Modal from "./Modal";
import { parseBuffer } from 'music-metadata-browser';
import { Tomorrow } from "next/font/google";
import { title } from "process";

export default function UploadModal() {
  const [isLoading, setIsLoading] = useState(false);
  const supabaseClient = useSupabaseClient();
  const { isOpen, onClose } = useUploadModal();
  const router = useRouter();
  const { user } = useUser();
  const moment = require('moment');

  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      author: "",
      title: "",
      song: null,
      image: null,
    },
  });

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);
      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];
      if (!imageFile || !songFile || !user) {
        toast.error("Missing fields");
        return;
      }
      
      const uniqueID = uniqid();

      let tmp_duration;
      let duration;

      try {
        const arrayBuffer = await songFile.arrayBuffer();
        const metadata = await parseBuffer(new Uint8Array(arrayBuffer), songFile.type);
        tmp_duration = metadata.format.duration ? Math.ceil(metadata.format.duration) : 0;
        duration = moment.utc(tmp_duration * 1000).format('HH:mm:ss');
        console.log(duration);
        console.log(values.title);
      } catch (error) {
        console.error("Error parsing song metadata:", error);
        duration = 0;
      }
      // upload song
      
      const { data: songData, error: songError } = await supabaseClient.storage
        .from("songs")
        .upload(`song-${values.author}-${uniqueID}`, songFile, {
          cacheControl: "3600",
          upsert: false,
        });
      if (songError) {
        setIsLoading(false);
        return toast.error("Failed song upload.");
      }

      // upload image
      const { data: imageData, error: imageError } =
        await supabaseClient.storage
          .from("images")
          .upload(`image-${values.author}-${uniqueID}`, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });
      if (imageError) {
        setIsLoading(false);
        return toast.error("Failed image upload.");
      }

        const {error: transactionError } = await supabaseClient.rpc("add_song_and_user_song", {
          user_id: user.id,
          title: values.title,
          author: values.author,
          image_path: imageData.path,
          song_path: songData.path,
          duration: duration,
        });
        
        if (transactionError) {
          setIsLoading(false);
          return toast.error(transactionError.message);
        }

      router.refresh();
      setIsLoading(false);
      toast.success("Song created!");
      reset();
      onClose();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onChange={onChange}
      title="Добавить музыку"
      description="Загрузите mp3 файл"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <Input
          id="title"
          disabled={isLoading}
          {...register("title", { required: true })}
          placeholder="Название"
        />
        <Input
          id="author"
          disabled={isLoading}
          {...register("author", { required: true })}
          placeholder="Автор"
        />
        <div>
          <div className="pb-1">Select a song file</div>
          <Input
            id="song"
            type="file"
            disabled={isLoading}
            accept=".mp3"
            {...register("song", { required: true })}
          />
        </div>
        <div>
          <div className="pb-1">Select an image</div>
          <Input
            id="song"
            type="file"
            disabled={isLoading}
            accept="image/*"
            {...register("image", { required: true })}
          />
        </div>
        <Button disabled={isLoading} type="submit">
          Загрузить
        </Button>
      </form>
    </Modal>
  );
}
