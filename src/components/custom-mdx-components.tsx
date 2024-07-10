import { ComponentType } from 'react';

import Theorem from './Theorem';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customMDXComponents: Record<string, ComponentType<any>> = {
  Theorem,
};

export default customMDXComponents;
