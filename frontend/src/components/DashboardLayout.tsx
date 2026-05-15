import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  actions,
}) => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-100 to-blue-50">
      <div className="h-full flex flex-col overflow-hidden p-4 md:p-6">
        {actions && (
          <div className="flex justify-end gap-3 mb-4 flex-shrink-0">
            {actions}
          </div>
        )}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
