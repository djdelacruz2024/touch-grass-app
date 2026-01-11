// Simple storage wrapper that mimics the Claude storage API
export const storage = {
  async get(key, shared = false) {
    try {
      const fullKey = shared ? `shared:${key}` : `user:${key}`;
      const value = localStorage.getItem(fullKey);
      if (value === null) {
        throw new Error('Key not found');
      }
      return { key, value, shared };
    } catch (error) {
      throw error;
    }
  },

  async set(key, value, shared = false) {
    try {
      const fullKey = shared ? `shared:${key}` : `user:${key}`;
      localStorage.setItem(fullKey, value);
      return { key, value, shared };
    } catch (error) {
      return null;
    }
  },

  async delete(key, shared = false) {
    try {
      const fullKey = shared ? `shared:${key}` : `user:${key}`;
      localStorage.removeItem(fullKey);
      return { key, deleted: true, shared };
    } catch (error) {
      return null;
    }
  },

  async list(prefix = '', shared = false) {
    try {
      const fullPrefix = shared ? `shared:${prefix}` : `user:${prefix}`;
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(fullPrefix)) {
          keys.push(key);
        }
      }
      return { keys, prefix, shared };
    } catch (error) {
      return null;
    }
  }
};

// Make it available globally like in Claude
if (typeof window !== 'undefined') {
  window.storage = storage;
}
