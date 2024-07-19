"use client";

//import { Range, Root, Track } from "@radix-ui/react-slider";

type Props = {
  value?: number;
  max: number;
  onChange?: (value: number) => void;
};

export default function Slider({ value, max, onChange }: Props) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(Number(e.target.value));
    console.log(max);
  };
  return (
    <input
      type="range"
      min="0"
      max={max}
      value={value}
      onChange={handleSliderChange}
      className="w-full h-2 bg-gray-300 rounded-lg cursor-pointer"
    />
    /*<Root
      className="relative flex h-10 w-full touch-none select-none items-center"
      defaultValue={[1]}
      value={[value!]}
      onChange={handleSliderChange}
      max={max}
      step={0.1}
    >
      <Track className="relative h-[3px] grow rounded-full bg-antiflash-white">
        <Range className="absolute h-full rounded-full bg-antiflash_white" />
      </Track>
    </Root>*/
  );
}
