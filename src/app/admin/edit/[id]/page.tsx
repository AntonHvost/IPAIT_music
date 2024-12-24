"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Song } from "@/types";

const EditTrack = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [track, setTrack] = useState<Partial<Song>>({});

  useEffect(() => {
    const fetchTrack = async () => {
      const { data, error } = await supabase.from("songs").select("*").eq("id", params.id).single();
      if (error) {
        console.error("Error fetching track:", error.message);
      } else {
        setTrack(data);
      }
    };

    fetchTrack();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(track.title)
    const { error } = await supabase.from("songs").update(track).eq("id", params.id);
    if (error) {
      console.error("Error updating track:", error.message);
    } else {
      router.push("/admin");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTrack((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Edit Track</h1>
      <input
        type="text"
        name="title"
        value={track.title || ""}
        onChange={handleInputChange}
        required
      />
      <input
        type="text"
        name="author"
        value={track.author || ""}
        onChange={handleInputChange}
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default EditTrack;