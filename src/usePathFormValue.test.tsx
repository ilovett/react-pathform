import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { PathFormProvider } from '.';
import { usePathFormValue } from './usePathFormValue';

const wrapper = ({ children }: { children: React.ReactChildren }) => (
  <PathFormProvider initialRenderValues={{ nested: { items: [{ name: 'Joey Joe Joe Jr. Shabadoo' }] } }}>{children}</PathFormProvider>
);

describe('usePathFormValue', () => {
  it('returns expected items', () => {
    const { result } = renderHook(() => usePathFormValue(['nested', 'items', 0, 'name']), { wrapper });
    expect(result.current[0]).toEqual('Joey Joe Joe Jr. Shabadoo');
    expect(result.current[1]).toMatchInlineSnapshot(`
      Object {
        "defaultValue": "Joey Joe Joe Jr. Shabadoo",
        "dirty": false,
        "error": null,
        "touched": false,
        "uuid": "uuid-1",
        "validations": null,
      }
    `);
  });

  it('returns the store root with an empty path', () => {
    const { result } = renderHook(() => usePathFormValue([]), { wrapper });
    const [value, meta] = result.current;

    // 1st item is store root
    expect(value).toMatchInlineSnapshot(`
      Object {
        "nested": Object {
          "items": Array [
            Object {
              "name": "Joey Joe Joe Jr. Shabadoo",
            },
          ],
        },
      }
    `);

    // 2nd item is meta
    expect(meta).toMatchInlineSnapshot(`
      Object {
        "defaultValue": Object {
          "nested": Object {
            "items": Array [
              Object {
                "name": "Joey Joe Joe Jr. Shabadoo",
              },
            ],
          },
        },
        "dirty": false,
        "error": null,
        "touched": false,
        "uuid": "uuid-5",
        "validations": null,
      }
    `);
  });

  it('returns the store root without a given path', () => {
    const { result } = renderHook(() => usePathFormValue(), { wrapper });
    const [value, meta] = result.current;

    // 1st item is store root
    expect(value).toMatchInlineSnapshot(`
      Object {
        "nested": Object {
          "items": Array [
            Object {
              "name": "Joey Joe Joe Jr. Shabadoo",
            },
          ],
        },
      }
    `);

    // 2nd item is meta
    expect(meta).toMatchInlineSnapshot(`
      Object {
        "defaultValue": Object {
          "nested": Object {
            "items": Array [
              Object {
                "name": "Joey Joe Joe Jr. Shabadoo",
              },
            ],
          },
        },
        "dirty": false,
        "error": null,
        "touched": false,
        "uuid": "uuid-5",
        "validations": null,
      }
    `);
  });
});
