/**
 * PageHeader Component
 * Consistent page title with optional actions
 */
import React from 'react';
import './PageHeader.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
    return (
        <div className="page-header">
            <div className="page-header-content">
                <h1 className="dashboard-title">{title}</h1>
                {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
            </div>

            {actions && (
                <div className="page-header-actions">
                    {actions}
                </div>
            )}
        </div>
    );
}

export default PageHeader;

