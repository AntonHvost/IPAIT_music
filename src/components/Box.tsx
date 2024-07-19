import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Box({ children, className }: Props) {
  return (
    <div
      className={twMerge(
        `
          h-fit
          w-full
          rounded-lg
          bg-delft_blue
        `,
        className
      )}
    >
      {children}
    </div>
  );
}
