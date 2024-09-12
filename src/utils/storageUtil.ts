
export const getSessionStorageItem = (key: string): string | null => {
  return sessionStorage.getItem(prefixedKey(key));
};

export const setSessionStorageItem = (key: string, value: string): void => {
  sessionStorage.setItem(prefixedKey(key), value);
};

export const removeSessionStorageItem = (key: string): void => {
  sessionStorage.removeItem(prefixedKey(key));
};

const prefixedKey = (key: string): string => {
  return `hugin_${key}`;
};
