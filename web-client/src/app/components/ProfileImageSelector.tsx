"use client";

import { useService } from "@/service/useService";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function ProfileImageSelector({
  size,
  defaultImageUrl,
  imageUrl,
  setImageUrl,
}: {
  size: number;
  defaultImageUrl?: string;
  imageUrl: string | null;
  setImageUrl: Dispatch<SetStateAction<string>>;
}) {
  const { fileService } = useService();

  useEffect(() => {
    if (defaultImageUrl) {
      setImageUrl(defaultImageUrl);
    }
  }, []);

  const handleUploadPicture = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await fileService.uploadFile({ file });
    setImageUrl(url);
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "5%",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
      }}
    >
      <label htmlFor="picture">
        <img
          src={
            imageUrl ??
            "https://storage.ams.lighterlinks.io/assets/placeholder.jpg"
          }
          alt="image"
          width={size}
          height={size}
        />
      </label>
      <input
        id="picture"
        type="file"
        accept="image/*"
        onChange={handleUploadPicture}
        style={{ display: "none" }}
      />
    </div>
  );
}
