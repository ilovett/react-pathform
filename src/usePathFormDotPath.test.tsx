import { renderHook } from '@testing-library/react-hooks';
import { usePathFormDotPath } from './usePathFormDotPath';

test('should return expected dotpath', () => {
  const { result } = renderHook(() => usePathFormDotPath(['deeply', 'nested', 'items', 0, 'name']));
  expect(result.current).toBe('deeply.nested.items[0].name');
});
