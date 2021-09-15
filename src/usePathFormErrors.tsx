import { useEffect, useMemo, useState } from 'react';
import { PathFormPath, usePathForm } from './usePathForm';

export const usePathFormErrors = (path?: PathFormPath) => {
  const [renders, setRenders] = useState(0);
  const { state, watchers } = usePathForm();

  // subscribe to errors, re-render when triggered
  useEffect(() => {
    const unsubscribe = watchers.current.on('errors', () => {
      setRenders((r) => {
        return r + 1;
      });
    });

    // on unmount, unsubscribe by calling the function
    return () => unsubscribe();
  }, [watchers]);

  // when renders is increased, return state ref errors

  return useMemo(() => {
    return state.current.errors;
    // ignore state ref dependency
    // eslint-disable-next-line
  }, [renders]);
};
