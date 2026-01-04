import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { pinata } from '../services/pinata';
import { Upload, X, Image as ImageIcon, AlertCircle, Lock, Unlock } from 'lucide-react';
import { useWallets, getEmbeddedConnectedWallet, useSendTransaction } from '@privy-io/react-auth';
import { parseUnits, erc20Abi, encodeFunctionData } from 'viem';

interface AssetSubmissionProps {
    onSuccess: () => void;
    onRedirectToRegister: () => void;
}

export function AssetSubmission({ onSuccess, onRedirectToRegister }: AssetSubmissionProps) {
    const { wallets } = useWallets();
    const embeddedWallet = getEmbeddedConnectedWallet(wallets);

    const [formData, setFormData] = useState({
        price: '',
        description: ''
    });
    const [isSpecialContent, setIsSpecialContent] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [directUrl, setDirectUrl] = useState('');
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
    const [urlWarning, setUrlWarning] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
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

    const { sendTransaction } = useSendTransaction({
        onError: (error) => {
            console.error('Fee payment failed', error);
            setUploadStatus('');
            setLoading(false);
        }
    });

    const isPriceInvalid = isSpecialContent && (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setValidationError(null);
        setUploadStatus('');

        // Validation for Paid Content
        if (isPriceInvalid) {
            setValidationError('Price must be greater than 0 for special content.');
            setLoading(false);
            return;
        }

        const creatorId = storage.getCreatorId();
        if (!creatorId) {
            onRedirectToRegister();
            return;
        }

        const finalPrice = isSpecialContent ? Number(formData.price) : 0;
        const isUnlockable = !isSpecialContent; // Free = unlocked (true), Special/Paid = locked (false)

        let finalUrl = '';

        // Helper to process fee
        const processFee = async () => {
            if (finalPrice <= 0) return; // No fee for free content

            setUploadStatus('Processing protocol fee...');
            const fee = finalPrice * 0.01;

            if (fee > 0) {
                if (!embeddedWallet) {
                    throw new Error('Wallet not connected');
                }

                const data = encodeFunctionData({
                    abi: erc20Abi,
                    functionName: 'transfer',
                    args: ['0x3141011f001FB5f1CdE0183ACDdD9434Fa473F70', parseUnits(fee.toFixed(6), 6)]
                });

                const receipt = await sendTransaction({
                    to: '0x83BDe9dF64af5e475DB44ba21C1dF25e19A0cf9a', // mUSDT
                    data: data,
                    chainId: 421614
                },
                    {
                        sponsor: true
                    });
                console.log('Fee paid:', receipt.hash);
            }
        };

        if (uploadMode === 'file') {
            if (!file) {
                setError("Please select an image file.");
                setLoading(false);
                return;
            }

            try {
                // 1. Process Payment (1% Fee)
                await processFee();

                // 2. Upload to Pinata
                setUploadStatus('Uploading image to IPFS...');
                finalUrl = await pinata.uploadFile(file);
                console.log('Pinata URL:', finalUrl);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to process request');
                setLoading(false);
                return;
            }
        } else {
            if (!directUrl.trim()) {
                setError("Please enter an image URL.");
                setLoading(false);
                return;
            }

            // Handle Payment for URL mode too
            try {
                await processFee();
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Payment failed');
                setLoading(false);
                return;
            }

            finalUrl = directUrl.trim();
        }

        try {
            // 3. Submit Asset to DB
            setUploadStatus('Creating asset...');
            console.log('finalUrl', finalUrl);
            console.log('finalPrice', finalPrice);
            console.log('isUnlockable', isUnlockable);
            console.log('creatorId', creatorId);
            console.log('description', formData.description);
            await api.submitAsset({
                creatorId: Number(creatorId),
                url: finalUrl,
                price: finalPrice,
                description: formData.description,
                unlockableContent: isUnlockable
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
                                <div className="relative rounded-xl overflow-hidden border border-gray-200 group max-w-[200px] mx-auto">
                                    <div 
                                        className="bg-gray-100 flex items-center justify-center"
                                        style={{ aspectRatio: '4/5' }}
                                    >
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
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
                                <div className="relative rounded-xl overflow-hidden border border-gray-200 max-w-[200px] mx-auto">
                                    <div 
                                        className="bg-gray-100 flex items-center justify-center"
                                        style={{ aspectRatio: '4/5' }}
                                    >
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
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

                {/* Content Access Toggle */}
                <div>
                    <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${isSpecialContent ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                {isSpecialContent ? <Lock size={20} /> : <Unlock size={20} />}
                            </div>
                            <div>
                                <span className="block font-medium text-gray-900">
                                    {isSpecialContent ? 'Special Content' : 'Free Content'}
                                </span>
                                <span className="block text-xs text-gray-500">
                                    {isSpecialContent ? 'Paid access only' : 'Visible to everyone'}
                                </span>
                            </div>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isSpecialContent}
                                onChange={(e) => setIsSpecialContent(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#12AAFF]"></div>
                        </div>
                    </label>
                </div>

                {/* Price Input (Conditional) */}
                {isSpecialContent && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (mUSDT) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="1"
                            required
                            min="1"
                            value={formData.price}
                            onChange={(e) => {
                                setFormData({ ...formData, price: e.target.value });
                                setValidationError(null);
                            }}
                            className={`w-full bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:bg-white transition-all ${validationError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                                }`}
                            placeholder="1.0"
                        />

                        {validationError && (
                            <p className="mt-1 text-sm text-red-500 animate-pulse">
                                {validationError}
                            </p>
                        )}

                        {formData.price && !isNaN(Number(formData.price)) && Number(formData.price) > 0 && (
                            <div className="mt-2 flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <AlertCircle className="w-4 h-4 text-[#12AAFF] flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-[#12AAFF]">Protocol Fee Required</p>
                                    <p>
                                        To create this asset, a 1% protocol fee of
                                        <strong className="mx-1 text-gray-900">{(Number(formData.price) * 0.01).toFixed(4)} mUSDT</strong>
                                        will be deducted from your wallet.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
                    disabled={loading || (isSpecialContent && (!formData.price || Number(formData.price) <= 0))}
                    className="w-full bg-[#12AAFF] text-white font-bold py-3 rounded-lg hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
