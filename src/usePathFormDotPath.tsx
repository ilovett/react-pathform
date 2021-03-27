import React from 'react';
import { PathFormPath, toDotPath } from '.';

export const usePathFormDotPath = (path: PathFormPath) => React.useMemo(() => toDotPath(path), [path]);
