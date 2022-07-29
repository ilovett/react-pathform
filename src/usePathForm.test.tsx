import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { PathFormProvider, usePathForm } from '.';

function wrapper({ children }: { children: React.ReactChildren }) {
  return (
    <PathFormProvider
      initialRenderValues={{
        nested: {
          items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }],
        },
      }}
    >
      {children}
    </PathFormProvider>
  );
}

describe('array', () => {
  function render() {
    return renderHook(() => usePathForm(), { wrapper });
  }

  describe('append', () => {
    it('adds items to the end of an array', () => {
      const { result } = render();

      expect(result.current.getValues()).toMatchSnapshot();

      result.current.array.append(['nested', 'items'], { name: 'LAST' });

      expect(result.current.getValues()).toMatchSnapshot();
    });
  });

  describe('insert', () => {
    it('inserts items into an array at a given index', () => {
      const { result } = render();

      expect(result.current.getValues()).toMatchSnapshot();

      result.current.array.insert(['nested', 'items'], 1, { name: 'AA' }, { name: 'AB' });

      expect(result.current.getValues()).toMatchSnapshot();
    });
  });

  describe('move', () => {
    it('moves items in an array from an index to another index', () => {
      const { result } = render();

      expect(result.current.getValues()).toMatchSnapshot();

      result.current.array.move(['nested', 'items'], 0, 4);

      expect(result.current.getValues()).toMatchSnapshot();
    });
  });

  describe('prepend', () => {
    it('prepends an item to the beginning of an array', () => {
      const { result } = render();

      expect(result.current.getValues()).toMatchSnapshot();

      result.current.array.prepend(['nested', 'items'], { name: 'FIRST' });

      expect(result.current.getValues()).toMatchSnapshot();
    });
  });

  describe('splice', () => {
    it('splices as expected', () => {
      const { result } = render();

      expect(result.current.getValues()).toMatchSnapshot();

      result.current.array.splice(['nested', 'items'], 1, 2, { name: 'BB' }, { name: 'CC' });

      expect(result.current.getValues()).toMatchSnapshot();
    });
  });

  describe('remove', () => {
    it('removes items from an array as expected', () => {
      const { result } = render();

      expect(result.current.getValues()).toMatchSnapshot();

      result.current.array.remove(['nested', 'items'], 1, 2);

      expect(result.current.getValues()).toMatchSnapshot();
    });

    it('removes one item from an array by default', () => {
      const { result } = render();

      expect(result.current.getValues()).toMatchSnapshot();

      result.current.array.remove(['nested', 'items'], 1);

      expect(result.current.getValues()).toMatchSnapshot();
    });
  });
});
