import { ComponentType } from 'react';

const Theorem = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <p>Theorem</p>
      {children}
    </div>
  );
};

const customMDXComponents: Record<string, ComponentType<any>> = {
  Theorem,
};

export default customMDXComponents;
