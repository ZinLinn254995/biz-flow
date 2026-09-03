import { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

function PageContainer({ title, subtitle, children }: PageContainerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      {children && <div className="space-y-6">{children}</div>}
    </div>
  );
}

export default PageContainer;
