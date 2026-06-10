// @ts-nocheck
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { presetToRange } from '../lib/dateUtils.js';
import { COST_DEFAULTS } from '../data/constants.js';

const useDashboardStore = create(
  persist(
    (set) => ({
      activeTab: 'summary',
      dateRange: (() => {
        const { start, end } = presetToRange('30d');
        return { preset: '30d', start, end };
      })(),
      costInputs: { ...COST_DEFAULTS },

      actions: {
        setActiveTab: (tab) => set({ activeTab: tab }),

        setDateRange: (opts) => set((state) => {
          if (opts.preset) {
            const { start, end } = presetToRange(opts.preset);
            return { dateRange: { preset: opts.preset, start, end } };
          }
          return { dateRange: { preset: null, start: opts.start, end: opts.end } };
        }),

        setCostInputs: (partial) => set((state) => ({
          costInputs: { ...state.costInputs, ...partial },
        })),
      },
    }),
    {
      name: 'toast-dashboard-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist costInputs — dateRange and activeTab reset on reload
      partialize: (state) => ({ costInputs: state.costInputs }),
    }
  )
);

export default useDashboardStore;
