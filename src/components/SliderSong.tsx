"use client";

//import { Range, Root, Track } from "@radix-ui/react-slider";

type Props = {
  value?: number;
  max: number;
  loadedChunks: number;
  onChange?: (value: number) => void;
};

export default function Slider({ value, max, loadedChunks, onChange }: Props) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(Number(e.target.value));
   // console.log(e.target.value);
  };
  return (
    <div className="relative w-full h-2 bg-gray-300 rounded-lg cursor-pointer">
    <input
      type="range"
      min="0"
      max={max}
      value={value}
      onChange={handleSliderChange}
      className="w-full h-2 bg-gray-300 rounded-lg cursor-pointer"
    />
    <div
      className="absolute top-0 left-0 h-2 bg-pink rounded-full"
      style={{ width: `${loadedChunks}%` }}
    />
  </div>
  );
}
