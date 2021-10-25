import { useDebugValue, useMemo } from 'react';
import { usePathForm } from './usePathForm';
import { usePathFormSubscription } from './usePathFormSubscription';

export function usePathFormDirtyUuids() {
  const renders = usePathFormSubscription('dirty');
  const { state } = usePathForm();

  useDebugValue(state.current.dirtyUuids);

  return useMemo(() => {
    return state.current.dirtyUuids;
    // ignore state ref dependency
    // eslint-disable-next-line
  }, [renders]);
}
