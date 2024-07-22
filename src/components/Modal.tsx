import {
  Close,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
} from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";

type Props = {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function Modal({
  isOpen,
  onChange,
  title,
  description,
  children,
}: Props) {
  return (
    <Root open={isOpen} defaultOpen={isOpen} onOpenChange={onChange}>
      <Portal>
        <Overlay className="fixed inset-0 bg-neutral-900/90 backdrop-blur-sm" />
        <Content className="fixed left-[50%] top-[50%] h-full max-h-full w-full translate-x-[-50%] translate-y-[-50%] rounded-md border border-neutral-700 bg-oxford_blue p-[25px] drop-shadow-md focus:outline-none md:h-auto md:max-h-[85vh] md:w-[90vw] md:max-w-[450px]">
          <Title className="mb-4 text-center text-xl font-bold">{title}</Title>
          <Description className="mb-5 text-center text-sm leading-normal">
            {description}
          </Description>
          <div>{children}</div>
          <Close asChild>
            <button className="absolute right-[10px] top-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full text-neutral-400 hover:text-white focus:outline-none">
              <IoMdClose />
            </button>
          </Close>
        </Content>
      </Portal>
    </Root>
  );
}
