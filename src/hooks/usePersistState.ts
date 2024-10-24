import {useEffect, useMemo, useState} from 'react';

// Hook to persist state in session storage
export default function usePersistState<T>(id: string, initialValue: T): [T, (newState: T) => void] {

  const value = useMemo(() => {
    const sessionStorageValue = sessionStorage.getItem('state:' + id);

    if (sessionStorageValue) {
      return JSON.parse(sessionStorageValue) as T;
    }

    return initialValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [state, setState] = useState<T>(value);

  useEffect(() => {
    const stateStr = JSON.stringify(state);
    sessionStorage.setItem('state:' + id, stateStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return [state, setState];
}
