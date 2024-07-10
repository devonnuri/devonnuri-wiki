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

export default Theorem;
