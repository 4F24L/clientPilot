
import { create } from 'zustand';

type TabType = 'leads' | 'projects' | 'support';

interface DashboardState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: 'leads',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
