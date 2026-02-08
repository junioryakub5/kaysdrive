/**
 * StatCard Component
 * Displays key metrics with icon, label, and value
 */
import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'primary' | 'success' | 'warning' | 'danger';
}

const colorStyles = {
    primary: { iconBg: '#dbeafe', iconColor: '#2563eb' },
    success: { iconBg: '#dcfce7', iconColor: '#22c55e' },
    warning: { iconBg: '#fef3c7', iconColor: '#f59e0b' },
    danger: { iconBg: '#fee2e2', iconColor: '#ef4444' },
};

export function StatCard({ icon, label, value, trend, color = 'primary' }: StatCardProps) {
    const styles = colorStyles[color];

    return (
        <div className="dashboard-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            {/* Icon */}
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: styles.iconBg,
                    color: styles.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '1.25rem',
                }}
            >
                {icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                    fontWeight: 500
                }}>
                    {label}
                </div>
                <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.2
                }}>
                    {value}
                </div>

                {/* Trend indicator */}
                {trend && (
                    <div style={{
                        fontSize: '0.75rem',
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: trend.isPositive ? 'var(--success)' : 'var(--danger)',
                    }}>
                        <span>{trend.isPositive ? '↑' : '↓'}</span>
                        <span>{Math.abs(trend.value)}%</span>
                        <span style={{ color: 'var(--text-muted)' }}>from last month</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StatCard;
