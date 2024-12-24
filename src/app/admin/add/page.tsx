"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { FormData } from "@/types";
import moment from "moment";

const AddTrack = () => {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    author: "",
    image: null,
    song: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { title, author, image, song } = formData;
    if (!title || !author || !image || !song) {
      alert("All fields are required.");
      return;
    }

    const uniqueID = `${title}-${Date.now()}`;

    // Upload song
    const { data: songData, error: songError } = await supabase.storage
      .from("songs")
      .upload(`songs/${uniqueID}`, song);
    if (songError) {
      alert("Error uploading song.");
      return;
    }

    // Upload image
    const { data: imageData, error: imageError } = await supabase.storage
      .from("images")
      .upload(`images/${uniqueID}`, image);
    if (imageError) {
      alert("Error uploading image.");
      return;
    }

    // Calculate duration
    const duration = moment.utc(Math.random() * 300000).format("HH:mm:ss"); // Replace with real duration

    // Insert track
    const { error } = await supabase.from("songs").insert({
      title,
      author,
      image_path: imageData.path,
      song_path: songData.path,
      duration,
    });

    if (error) {
      console.error("Error adding track:", error.message);
    } else {
      router.push("/");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Add Track</h1>
      <input type="text" name="title" placeholder="Title" onChange={handleInputChange} required />
      <input type="text" name="author" placeholder="Author" onChange={handleInputChange} required />
      <input type="file" name="image" onChange={handleInputChange} accept="image/*" required />
      <input type="file" name="song" onChange={handleInputChange} accept=".mp3" required />
      <button type="submit">Submit</button>
    </form>
  );
};

export default AddTrack;