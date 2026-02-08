import { useState, useRef } from 'react';

interface ImageUploadProps {
    images: string[];
    onChange: (urls: string[]) => void;
    maxImages?: number;
}

export const ImageUpload = ({ images, onChange, maxImages = 10 }: ImageUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remainingSlots = maxImages - images.length;
        const filesToUpload = Array.from(files).slice(0, remainingSlots);

        if (filesToUpload.length === 0) {
            alert(`Maximum ${maxImages} images allowed`);
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            filesToUpload.forEach(file => {
                formData.append('images', file);
            });

            const response = await fetch('http://localhost:3001/api/upload/multiple', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            const newImageUrls = data.urls.map((url: string) => `http://localhost:3001${url}`);
            onChange([...images, ...newImageUrls]);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {images.map((url, index) => (
                    <div key={index} style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', aspectRatio: '1', border: '2px solid var(--border)' }}>
                        <img
                            src={url}
                            alt={`Upload ${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: '2px dashed var(--border)',
                            borderRadius: '0.5rem',
                            aspectRatio: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            background: 'var(--bg-secondary)',
                            opacity: uploading ? 0.5 : 1,
                        }}
                    >
                        <div style={{ fontSize: '2rem' }}>+</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {uploading ? 'Uploading...' : 'Add Image'}
                        </div>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {images.length} / {maxImages} images • Maximum 5MB per image
            </p>
        </div>
    );
};
