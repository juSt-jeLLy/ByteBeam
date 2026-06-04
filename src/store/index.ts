import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type TripSortKey = "startedAt" | "distanceKm" | "idleMinutes" | "overspeedEvents";

interface AppStore {
  mobileDrawerOpen: boolean;
  globalSearch: string;
  selectedVehicleId: string;
  tripSearch: string;
  tripSortKey: TripSortKey;
  tripDateFrom: string;
  tripDateTo: string;
  setMobileDrawerOpen: (open: boolean) => void;
  setGlobalSearch: (search: string) => void;
  setSelectedVehicleId: (vehicleId: string) => void;
  setTripSearch: (search: string) => void;
  setTripSortKey: (sortKey: TripSortKey) => void;
  setTripDateFrom: (date: string) => void;
  setTripDateTo: (date: string) => void;
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        mobileDrawerOpen: false,
        globalSearch: "",
        selectedVehicleId: "veh-001",
        tripSearch: "",
        tripSortKey: "startedAt",
        tripDateFrom: "",
        tripDateTo: "",
        setMobileDrawerOpen: (mobileDrawerOpen) => set({ mobileDrawerOpen }),
        setGlobalSearch: (globalSearch) => set({ globalSearch }),
        setSelectedVehicleId: (selectedVehicleId) => set({ selectedVehicleId }),
        setTripSearch: (tripSearch) => set({ tripSearch }),
        setTripSortKey: (tripSortKey) => set({ tripSortKey }),
        setTripDateFrom: (tripDateFrom) => set({ tripDateFrom }),
        setTripDateTo: (tripDateTo) => set({ tripDateTo }),
      }),
      { name: "bytebeam-fleet-store" },
    ),
    { name: "BytebeamFleetStore" },
  ),
);

export const useMobileDrawerOpen = () => useAppStore((state) => state.mobileDrawerOpen);
export const useGlobalSearch = () => useAppStore((state) => state.globalSearch);
export const useSelectedVehicleId = () => useAppStore((state) => state.selectedVehicleId);
export const useTripSearch = () => useAppStore((state) => state.tripSearch);
export const useTripSortKey = () => useAppStore((state) => state.tripSortKey);
export const useTripDateFrom = () => useAppStore((state) => state.tripDateFrom);
export const useTripDateTo = () => useAppStore((state) => state.tripDateTo);
export const useSetMobileDrawerOpen = () => useAppStore((state) => state.setMobileDrawerOpen);
export const useSetGlobalSearch = () => useAppStore((state) => state.setGlobalSearch);
export const useSetSelectedVehicleId = () => useAppStore((state) => state.setSelectedVehicleId);
export const useSetTripSearch = () => useAppStore((state) => state.setTripSearch);
export const useSetTripSortKey = () => useAppStore((state) => state.setTripSortKey);
export const useSetTripDateFrom = () => useAppStore((state) => state.setTripDateFrom);
export const useSetTripDateTo = () => useAppStore((state) => state.setTripDateTo);
