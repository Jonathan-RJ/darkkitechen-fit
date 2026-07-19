const STORAGE_KEY = "vive-fit-order";

export const loadOrder = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const saveOrder = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage can fail in private browsing; the app still works in memory.
  }
};

export const clearOrder = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // No action needed.
  }
};
