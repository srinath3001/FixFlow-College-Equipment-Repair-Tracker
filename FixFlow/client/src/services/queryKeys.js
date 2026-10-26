// FixFlow - Centralized TanStack Query Keys
// Provides consistent cache keys for React Query invalidation and refetching.

export const queryKeys = {
  complaints: {
    all: ["complaints"],
    list: (filters) => ["complaints", "list", filters],
    detail: (id) => ["complaints", "detail", id],
  },
  technicians: {
    all: ["technicians"],
    list: () => ["technicians", "list"],
    detail: (id) => ["technicians", "detail", id],
  },
  equipment: {
    all: ["equipment"],
    list: (category) => ["equipment", "list", { category }],
    detail: (id) => ["equipment", "detail", id],
  },
  dashboard: {
    stats: ["dashboard", "stats"],
    charts: ["dashboard", "charts"],
    recent: ["dashboard", "recent"],
    activity: ["dashboard", "activity"],
  },
  health: ["system", "health"],
};
