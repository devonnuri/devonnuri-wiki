import { ComponentType } from 'react';

import RecentChange from './RecentChange';
import Theorem from './Theorem';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customMDXComponents: Record<string, ComponentType<any>> = {
  Theorem,
  RecentChange,
};

export default customMDXComponents;
