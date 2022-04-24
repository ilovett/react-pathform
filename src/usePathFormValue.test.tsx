import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { PathFormProvider } from '.';
import { usePathFormValue } from './usePathFormValue';

test('should return the expected value and meta', () => {
  const wrapper = ({ children }: { children: React.ReactChildren }) => (
    <PathFormProvider initialRenderValues={{ nested: { items: [{ name: 'Joey Joe Joe Jr. Shabadoo' }] } }}>{children}</PathFormProvider>
  );

  const { result } = renderHook(() => usePathFormValue(['nested', 'items', 0, 'name']), { wrapper });
  expect(result.current[0]).toEqual('Joey Joe Joe Jr. Shabadoo');
  expect(result.current[1]).toMatchInlineSnapshot(`
    Object {
      "defaultValue": "Joey Joe Joe Jr. Shabadoo",
      "dirty": false,
      "error": null,
      "touched": false,
      "uuid": "uuid-3",
      "validations": null,
    }
  `);
});
