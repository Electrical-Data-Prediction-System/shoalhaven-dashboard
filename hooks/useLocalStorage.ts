import { useRef, useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener("local-storage-update", callback);
    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("local-storage-update", callback);
    }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const lastStringRef = useRef<string>("");
  const initialString = JSON.stringify(initialValue);

  const getSnapshot = () => {
    if (typeof window === "undefined") return initialString;

    try {
        const item = localStorage.getItem(key);

        if (item === "[object Object]") {
            localStorage.setItem(key, initialString);
            return initialString;
        }

        const nextString = item ? item : initialString;

        if (nextString !== lastStringRef.current) {
            lastStringRef.current = nextString;
        }

        return lastStringRef.current;
    } catch (error) {
        return initialString;
    }
  };

    const getServerSnapshot = () => JSON.stringify(initialValue);
    const storeString = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    let value: T;

    try {
        value = JSON.parse(storeString) as T;
    } catch (error) {
        console.warn(`Resetting corrupted storage payload for key: ${key}`);
        value = initialValue;   
    }

  const setValue = (newValue: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
      window.dispatchEvent(new Event("local-storage-update"));
    } catch (error) {
      console.error(`Could not save updates for key: ${key}`, error);
    }
  };

    return [value, setValue];
}