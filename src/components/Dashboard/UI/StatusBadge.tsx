/**
 * StatusBadge Component
 * Displays colored status indicators
 */
import React from 'react';

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
    status: StatusType;
    children: React.ReactNode;
}

const statusConfig: Record<StatusType, { bg: string; color: string }> = {
    success: { bg: 'var(--success-bg)', color: '#15803d' },
    warning: { bg: 'var(--warning-bg)', color: '#b45309' },
    danger: { bg: 'var(--danger-bg)', color: '#b91c1c' },
    info: { bg: 'var(--info-bg)', color: '#1d4ed8' },
    neutral: { bg: 'var(--bg-active)', color: 'var(--text-secondary)' },
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                background: config.bg,
                color: config.color,
            }}
        >
            {children}
        </span>
    );
}

// Helper function to map status strings to types
export function getStatusType(status: string): StatusType {
    const statusMap: Record<string, StatusType> = {
        active: 'success',
        approved: 'success',
        published: 'success',
        pending: 'warning',
        draft: 'warning',
        inactive: 'danger',
        rejected: 'danger',
        unpublished: 'neutral',
    };

    return statusMap[status.toLowerCase()] || 'neutral';
}

export default StatusBadge;
