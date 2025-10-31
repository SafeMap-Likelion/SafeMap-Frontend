//selectLocationWithCat.tsx를 select-location-page-auth.tsx에서 맞춤 활용할 수 있도록 함
import { create } from "zustand";
type SelectLocationState = {
  isAuthPage: boolean;
  setIsAuthPage: (isAuthPage: boolean) => void;
};

export const useSelectLocationStore = create<SelectLocationState>((set) => ({
  isAuthPage: false,
  setIsAuthPage: (value) => set({ isAuthPage: value }),
}));
