import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { pinata } from '../services/pinata';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface AssetSubmissionProps {
    onSuccess: () => void;
    onRedirectToRegister: () => void;
}

export function AssetSubmission({ onSuccess, onRedirectToRegister }: AssetSubmissionProps) {
    const [formData, setFormData] = useState({
        price: '',
        description: ''
    });
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [directUrl, setDirectUrl] = useState('');
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
    const [urlWarning, setUrlWarning] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const creatorId = storage.getCreatorId();
        if (!creatorId) {
            onRedirectToRegister();
        }
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [onRedirectToRegister, previewUrl]);

    const handleFileChange = (selectedFile: File) => {
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setError("File size exceeds 10MB limit.");
                return;
            }
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const isValidImageUrl = (url: string): boolean => {
        // Check if URL ends with common image extensions
        const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|svg|webp)(\?.*)?$/i;
        return imageExtensions.test(url);
    };

    const handleUrlChange = (url: string) => {
        setDirectUrl(url);
        setUrlWarning(null);

        if (url.trim()) {
            if (!isValidImageUrl(url)) {
                setUrlWarning('⚠️ Warning: This URL may not be a direct image link. Please ensure it ends with .jpg, .png, .gif, etc.');
            }
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setUploadStatus('');

        const creatorId = storage.getCreatorId();
        if (!creatorId) {
            onRedirectToRegister();
            return;
        }

        let finalUrl = '';

        if (uploadMode === 'file') {
            if (!file) {
                setError("Please select an image file.");
                setLoading(false);
                return;
            }

            try {
                // 1. Upload to Pinata
                setUploadStatus('Uploading image to IPFS...');
                finalUrl = await pinata.uploadFile(file);
                console.log('Pinata URL:', finalUrl);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to upload file');
                setLoading(false);
                return;
            }
        } else {
            if (!directUrl.trim()) {
                setError("Please enter an image URL.");
                setLoading(false);
                return;
            }
            finalUrl = directUrl.trim();
        }

        try {
            // 2. Submit Asset to DB
            setUploadStatus('Creating asset...');
            await api.submitAsset({
                creatorId: Number(creatorId),
                url: finalUrl,
                price: Number(formData.price),
                description: formData.description,
                unlockableContent: false // New assets are locked by default
            });

            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to submit asset');
        } finally {
            setLoading(false);
            setUploadStatus('');
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-gray-200 shadow-sm mt-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Create New Asset</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Upload Mode Tabs */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Upload Image
                    </label>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => setUploadMode('file')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${uploadMode === 'file'
                                ? 'bg-[#12AAFF] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            📤 Upload File
                        </button>
                        <button
                            type="button"
                            onClick={() => setUploadMode('url')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${uploadMode === 'url'
                                ? 'bg-[#12AAFF] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            🔗 Paste URL
                        </button>
                    </div>

                    {/* File Upload Mode */}
                    {uploadMode === 'file' && (
                        <>
                            {!file ? (
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={onDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center text-center group"
                                >
                                    <div className="w-12 h-12 bg-blue-50 text-[#12AAFF] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-gray-900 font-medium">Click to upload or drag and drop</p>
                                    <p className="text-gray-500 text-xs mt-1">SVG, PNG, JPG or GIF (max. 10MB)</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                                    />
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                        ) : (
                                            <ImageIcon className="text-gray-300" size={48} />
                                        )}
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                                            className="p-1.5 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-sm backdrop-blur-sm transition"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                                        <ImageIcon size={16} className="text-[#12AAFF]" />
                                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* URL Input Mode */}
                    {uploadMode === 'url' && (
                        <div className="space-y-3">
                            <input
                                type="url"
                                value={directUrl}
                                onChange={(e) => handleUrlChange(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                                placeholder="https://example.com/image.jpg"
                            />

                            {urlWarning && (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-lg text-xs">
                                    {urlWarning}
                                </div>
                            )}

                            {/* Preview */}
                            {previewUrl && (
                                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                e.currentTarget.src = '';
                                                e.currentTarget.alt = 'Failed to load image';
                                                e.currentTarget.className = 'hidden';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (ETH)
                    </label>
                    <input
                        type="number"
                        step="0.001"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                        placeholder="0.1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 h-32 resize-none transition-all"
                        placeholder="Describe your asset..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#12AAFF] text-white font-bold py-3 rounded-lg hover:bg-blue-600 disabled:opacity-70 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{uploadStatus || 'Processing...'}</span>
                        </>
                    ) : (
                        'Create Asset'
                    )}
                </button>
            </form>
        </div>
    );
}
