import { create } from "zustand";

type DonationStore = {
  amount: number;
  setAmount: (amount: number) => void;
};

export const useDonationStore = create<DonationStore>((set) => ({
  amount: 100000,
  setAmount: (amount) => set({ amount })
}));
