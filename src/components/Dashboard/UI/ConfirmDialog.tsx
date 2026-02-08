/**
 * ConfirmDialog Component
 * Confirmation dialog for destructive actions
 */
import React from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    isLoading = false,
}: ConfirmDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="confirm-dialog">
                {/* Warning Icon */}
                <div
                    className="confirm-dialog-icon"
                    style={{
                        color: type === 'danger' ? 'var(--danger)' : 'var(--warning)',
                    }}
                >
                    ⚠️
                </div>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    {message}
                </p>

                <div className="confirm-dialog-buttons">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmDialog;
