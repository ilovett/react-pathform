import { renderHook } from '@testing-library/react-hooks';
import { usePathFormStorePath } from './usePathFormStorePath';

test('should convert given path to the store path to access the store item', () => {
  const { result } = renderHook(() => usePathFormStorePath(['deeply', 'nested', 'items', 0, 'name']));
  expect(result.current).toEqual(['deeply', 'value', 'nested', 'value', 'items', 'value', 0, 'value', 'name']);
});
