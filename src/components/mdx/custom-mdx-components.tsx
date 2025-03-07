import { ComponentType } from 'react';

import RecentChanges from './RecentChanges';
import Theorem from './Theorem';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customMDXComponents: Record<string, ComponentType<any>> = {
  Theorem,
  RecentChanges,
};

export default customMDXComponents;
