const mockAsyncStorage = (() => {
  let storage = {};

  return {
    setItem: jest.fn((key, value) => {
      return new Promise((resolve, reject) => {
        process.nextTick(() => {
          storage[key] = value;
          resolve(null);
        });
      });
    }),
    getItem: jest.fn((key) => {
      return new Promise((resolve) => {
        process.nextTick(() => {
          resolve(storage[key] || null);
        });
      });
    }),
    removeItem: jest.fn((key) => {
      return new Promise((resolve, reject) => {
        process.nextTick(() => {
          delete storage[key];
          resolve(null);
        });
      });
    }),
    clear: jest.fn(() => {
      return new Promise((resolve) => {
        process.nextTick(() => {
          storage = {};
          resolve(null);
        });
      });
    }),
    getAllKeys: jest.fn(() => {
      return new Promise((resolve) => {
        process.nextTick(() => {
          resolve(Object.keys(storage));
        });
      });
    }),
    multiSet: jest.fn((keyValuePairs) => {
      return new Promise((resolve) => {
        process.nextTick(() => {
          keyValuePairs.forEach(([key, value]) => {
            storage[key] = value;
          });
          resolve(null);
        });
      });
    }),
    multiGet: jest.fn((keys) => {
      return new Promise((resolve) => {
        process.nextTick(() => {
          const values = keys.map((key) => [key, storage[key] || null]);
          resolve(values);
        });
      });
    }),
    multiRemove: jest.fn((keys) => {
      return new Promise((resolve) => {
        process.nextTick(() => {
          keys.forEach((key) => {
            delete storage[key];
          });
          resolve(null);
        });
      });
    }),
  };
})();

export default mockAsyncStorage;
