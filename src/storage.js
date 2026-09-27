// Simple localStorage-backed key/value store.
// Keys are namespaced as `user:` (private) or `shared:` (leaderboard) entries.
const namespace = (shared) => (shared ? 'shared:' : 'user:');

export const storage = {
  // Resolves to null when the key does not exist.
  async get(key, shared = false) {
    const value = localStorage.getItem(namespace(shared) + key);
    return value === null ? null : { key, value, shared };
  },

  async set(key, value, shared = false) {
    try {
      localStorage.setItem(namespace(shared) + key, value);
      return { key, value, shared };
    } catch (error) {
      return null;
    }
  },

  async delete(key, shared = false) {
    try {
      localStorage.removeItem(namespace(shared) + key);
      return { key, deleted: true, shared };
    } catch (error) {
      return null;
    }
  },

  // Returns keys without the namespace so they can be passed straight back to get().
  async list(prefix = '', shared = false) {
    try {
      const ns = namespace(shared);
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(ns + prefix)) {
          keys.push(key.slice(ns.length));
        }
      }
      return { keys, prefix, shared };
    } catch (error) {
      return null;
    }
  }
};

if (typeof window !== 'undefined') {
  window.storage = storage;
}
