import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: false,
  theme: 'dark',
  venueMapSidePanelOpen: false,
  selectedVenue: null,
  toasts: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setTheme: (theme) => set({ theme }),

  openVenueSidePanel: (venue) => set({ venueMapSidePanelOpen: true, selectedVenue: venue }),

  closeVenueSidePanel: () => set({ venueMapSidePanelOpen: false, selectedVenue: null }),

  addToast: (message, type = 'info') => set((state) => ({
    toasts: [...state.toasts, { id: Date.now(), message, type }],
  })),

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((toast) => toast.id !== id),
  })),
}));

export default useUIStore;
