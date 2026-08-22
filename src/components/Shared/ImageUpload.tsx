import { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
    images: string[];
    onChange: (urls: string[]) => void;
    maxImages?: number;
    /** Override the upload endpoint. Defaults to /upload/multiple (cars). */
    uploadUrl?: string;
    /** JWT token to include as Authorization: Bearer <token>. */
    token?: string | null;
}

export const ImageUpload = ({ images, onChange, maxImages = 10, uploadUrl, token }: ImageUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const defaultUploadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload/multiple`;
    const resolvedUploadUrl = uploadUrl ?? defaultUploadUrl;

    const uploadFiles = async (files: File[]) => {
        const remainingSlots = maxImages - images.length;
        const filesToUpload = files.slice(0, remainingSlots);

        if (filesToUpload.length === 0) {
            alert(`Maximum ${maxImages} images allowed`);
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            filesToUpload.forEach(file => formData.append('images', file));

            const headers: HeadersInit = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(resolvedUploadUrl, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            const newImageUrls = data.urls.map((url: string) => {
                if (url.startsWith('http://') || url.startsWith('https://')) return url;
                return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${url}`;
            });
            onChange([...images, ...newImageUrls]);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        await uploadFiles(Array.from(files));
    };

    const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) await uploadFiles(files);
    }, [images, maxImages]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    const removeImage = (index: number) => {
        onChange(images.filter((_, i) => i !== index));
    };

    const canAddMore = images.length < maxImages;

    return (
        <div>
            {/* Existing images grid */}
            {images.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                }}>
                    {images.map((url, index) => (
                        <div key={index} style={{
                            position: 'relative',
                            borderRadius: '0.5rem',
                            overflow: 'hidden',
                            aspectRatio: '1',
                            border: '2px solid var(--border)',
                        }}>
                            <img
                                src={url}
                                alt={`Upload ${index + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                style={{
                                    position: 'absolute', top: '4px', right: '4px',
                                    background: '#ef4444', color: 'white', border: 'none',
                                    borderRadius: '50%', width: '22px', height: '22px',
                                    cursor: 'pointer', fontSize: '13px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Drop zone — always visible when can add more */}
            {canAddMore && (
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    style={{
                        border: `2px dashed ${dragging ? '#6366f1' : 'var(--border)'}`,
                        borderRadius: '0.75rem',
                        padding: '2rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        background: dragging ? 'rgba(99,102,241,0.05)' : 'var(--bg-secondary)',
                        opacity: uploading ? 0.6 : 1,
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                        {uploading ? '⏳' : '📷'}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {uploading ? 'Uploading...' : 'Click or drag & drop photos here'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {uploading
                            ? 'Please wait'
                            : `Select multiple photos at once • Max ${maxImages} images • 100MB each`
                        }
                    </div>
                    {!uploading && (
                        <div style={{
                            marginTop: '0.5rem',
                            background: 'var(--primary, #6366f1)',
                            color: 'white',
                            padding: '0.4rem 1.2rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                        }}>
                            Browse Files
                        </div>
                    )}
                </div>
            )}

            {/* Hidden input — multiple is key */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {images.length} / {maxImages} photos added
                {images.length === 0 && ' • Hold Ctrl (or Cmd on Mac) to select multiple files'}
            </p>
        </div>
    );
};
