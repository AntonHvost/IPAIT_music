import { create } from "zustand";

type PlayerStore = {
  ids: string[];
  activeId?: string;
  setId: (id: string) => void;
  setIds: (ids: string[]) => void;
  reset: () => void;
};


const usePlayer = create<PlayerStore>((set) => ({
  ids: [],
  activeId: undefined,
  setId: (id: string) => set((state) => ({ ...state, activeId: id })),
  setIds: (ids: string[]) => set((state) => ({ ...state, ids })),
  reset: () => set({ ids: [], activeId: undefined }),
}));

export default usePlayer;
