import * as React from 'react';

import { usePathFormErrors, usePathFormDirtyUuids, usePathFormValue } from '../../dist';

export function PathFormDevTools() {
  const dirty = usePathFormDirtyUuids();
  const errors = usePathFormErrors();
  const [, charactersMeta] = usePathFormValue(['characters']);

  return (
    <>
      <div>dirty</div>
      <pre>{JSON.stringify(dirty, null, 2)}</pre>
      <div>errors</div>
      <pre>{JSON.stringify(errors, null, 2)}</pre>
      <div>characters array meta</div>
      <pre style={{ fontSize: 10 }}>{JSON.stringify(charactersMeta, null, 2)}</pre>
    </>
  );
}
