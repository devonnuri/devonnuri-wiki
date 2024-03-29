import { ComponentType } from 'react';

interface TheoremProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}
const Theorem = ({ children, title, subtitle }: TheoremProps) => {
  return (
    <div className="theorem">
      <div className="theorem-header">
        <span className="theorem-title">{title || 'Theorem'}</span>
        {subtitle && <span className="theorem-subtitle">{subtitle}</span>}
      </div>
      <div className="theorem-body">{children}</div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customMDXComponents: Record<string, ComponentType<any>> = {
  Theorem,
};

export default customMDXComponents;
