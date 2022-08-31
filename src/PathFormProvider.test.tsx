import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { PathFormProvider, usePathForm } from '.';

const defaultInitialRenderValues = {
  nested: {
    items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }],
  },
};

function Wrapper({ children, initialRenderValues = defaultInitialRenderValues }: { children?: ReactNode; initialRenderValues?: any }) {
  return <PathFormProvider initialRenderValues={initialRenderValues}>{children}</PathFormProvider>;
}

function render(initialRenderValues?: any) {
  return renderHook(() => usePathForm(), { wrapper: (props) => <Wrapper {...props} initialRenderValues={initialRenderValues} /> });
}

describe('PathFormProvider', () => {
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

  describe('initialRenderValues', () => {
    it('can be an object', () => {
      const { result } = render();
      expect(result.current.getValues()).toMatchInlineSnapshot(`
Object {
  "nested": Object {
    "items": Array [
      Object {
        "name": "A",
      },
      Object {
        "name": "B",
      },
      Object {
        "name": "C",
      },
      Object {
        "name": "D",
      },
    ],
  },
}
`);
    });

    it('can be an array', () => {
      const { result } = render([1, 2, 3]);
      expect(result.current.getValues()).toMatchInlineSnapshot(`
Array [
  1,
  2,
  3,
]
`);
    });

    it('can be a primitive', () => {
      const { result } = render(null);
      expect(result.current.getValues()).toMatchInlineSnapshot(`null`);
    });

    it('can be a primitive `number`', () => {
      const { result } = render(123);
      expect(result.current.getValues()).toMatchInlineSnapshot(`123`);
    });

    it('can be a primitive `string`', () => {
      const { result } = render('Hello World!');
      expect(result.current.getValues()).toMatchInlineSnapshot(`"Hello World!"`);
    });
  });
});
