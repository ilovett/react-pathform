import React, { memo } from 'react';
import { PathFormStoreItemFlat } from '.';
import { usePathFormErrors } from './usePathFormErrors';

export interface PathFormErrorsProps {
  render: (props: PathFormStoreItemFlat[]) => React.ReactElement;
}

export const PathFormErrors: React.FC<PathFormErrorsProps> = memo(({ render }) => {
  const storeItemsWithErrors = usePathFormErrors();

  if (!storeItemsWithErrors.length) {
    return null;
  }

  return render(storeItemsWithErrors);
});
