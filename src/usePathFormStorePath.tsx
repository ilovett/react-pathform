import React from 'react';
import { PathFormPath, toStorePath } from '.';

export const usePathFormStorePath = (path: PathFormPath) => React.useMemo(() => toStorePath(path), [path]);
