"use client";

import { Range, Root, Track } from "@radix-ui/react-slider";

type Props = {
  value?: number;
  max: number;
  onChange?: (value: number) => void;
};

export default function Slider({ value, max, onChange }: Props) {
  const handleChange = (newValue: number[]) => {
    onChange?.(newValue[0]);
  };
  return (
    <Root
      className="relative flex h-10 w-full touch-none select-none items-center"
      defaultValue={[1]}
      value={[value!]}
      onValueChange={handleChange}
      max={max}
      step={0.1}
      aria-label="Volume"
    >
      <Track className="relative h-[3px] grow rounded-full bg-neutral-600">
        <Range className="absolute h-full rounded-full bg-antiflash_white" />
      </Track>
    </Root>
  );
}
