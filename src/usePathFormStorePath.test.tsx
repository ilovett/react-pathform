import { renderHook } from '@testing-library/react-hooks';
import { usePathFormStorePath } from './usePathFormStorePath';

describe('usePathFormStorePath', () => {
  it('handles object property paths', () => {
    const { result } = renderHook(() => usePathFormStorePath(['deeply', 'nested', 'items', 0, 'name']));
    expect(result.current).toEqual(['value', 'deeply', 'value', 'nested', 'value', 'items', 'value', 0, 'value', 'name']);
  });

  it('handles array index property paths', () => {
    const { result } = renderHook(() => usePathFormStorePath([0, 0]));
    expect(result.current).toEqual(['value', 0, 'value', 0]);
  });

  it('handles empty path', () => {
    const { result } = renderHook(() => usePathFormStorePath([]));
    expect(result.current).toEqual([]);
  });
});
