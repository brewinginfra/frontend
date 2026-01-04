import { useState } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { User, LogIn, Sparkles, Wallet } from 'lucide-react';

interface CreatorRegistrationProps {
    onSuccess: () => void;
}

export function CreatorRegistration({ onSuccess }: CreatorRegistrationProps) {
    // Toggle between 'signup' and 'signin' modes
    const [mode, setMode] = useState<'signup' | 'signin'>('signup');

    // Sign Up form state
    const [name, setName] = useState('');
    const [walletAddress, setWalletAddress] = useState('');

    // Sign In form state
    const [loginUsername, setLoginUsername] = useState('');
    const [loginWalletAddress, setLoginWalletAddress] = useState('');

    // Focus states for animations
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.registerCreator(name, walletAddress);
            storage.saveCreatorId(response.id);
            setSuccess(true);
            setTimeout(() => onSuccess(), 800);
        } catch (err: any) {
            setError(err.message || 'Failed to register creator');
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.loginCreator(loginUsername, loginWalletAddress);
            storage.saveCreatorId(response.creatorId);
            setSuccess(true);
            setTimeout(() => onSuccess(), 800);
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 px-4">
            {/* Animated Container */}
            <div
                className={`bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden transform transition-all duration-500 ${success ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                    }`}
                style={{
                    boxShadow: '0 25px 50px -12px rgba(18, 170, 255, 0.15), 0 0 0 1px rgba(18, 170, 255, 0.05)'
                }}
            >
                {/* Gradient Header */}
                <div className="relative bg-gradient-to-r from-[#12AAFF] to-[#0088DD] p-6">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
                    <div className="relative flex items-center justify-center gap-2">
                        <Sparkles className="w-6 h-6 text-white animate-pulse" />
                        <h1 className="text-xl font-bold text-white">Creator Portal</h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex relative bg-gray-50">
                    {/* Sliding Indicator */}
                    <div
                        className="absolute bottom-0 h-0.5 bg-[#12AAFF] transition-all duration-300 ease-out"
                        style={{
                            width: '50%',
                            left: mode === 'signup' ? '0%' : '50%'
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setMode('signup');
                            setError(null);
                        }}
                        className={`flex-1 py-4 px-6 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'signup'
                            ? 'text-[#12AAFF]'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <User className={`w-4 h-4 transition-transform duration-300 ${mode === 'signup' ? 'scale-110' : 'scale-100'}`} />
                        Sign Up
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMode('signin');
                            setError(null);
                        }}
                        className={`flex-1 py-4 px-6 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'signin'
                            ? 'text-[#12AAFF]'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <LogIn className={`w-4 h-4 transition-transform duration-300 ${mode === 'signin' ? 'scale-110' : 'scale-100'}`} />
                        Sign In
                    </button>
                </div>

                {/* Form Content with Animation */}
                <div className="p-8 relative overflow-hidden">
                    {/* Animated Title */}
                    <h2
                        key={`title-${mode}`}
                        className="text-2xl font-bold mb-2 text-gray-900 text-center animate-fade-in"
                        style={{
                            animation: 'slideUp 0.3s ease-out'
                        }}
                    >
                        {mode === 'signup' ? 'Become a Creator' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-500 text-sm text-center mb-6">
                        {mode === 'signup'
                            ? 'Join our community of creators'
                            : 'Sign in to continue creating'}
                    </p>

                    {/* Error Message with Animation */}
                    {error && (
                        <div
                            className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 animate-shake"
                            style={{
                                animation: 'shake 0.5s ease-in-out'
                            }}
                        >
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-red-500">✕</span>
                            </div>
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div
                            className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-3"
                            style={{
                                animation: 'slideUp 0.3s ease-out'
                            }}
                        >
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-green-500">✓</span>
                            </div>
                            {mode === 'signup' ? 'Account created successfully!' : 'Signed in successfully!'}
                        </div>
                    )}

                    {/* Forms with Slide Animation */}
                    <div
                        key={`form-${mode}`}
                        style={{
                            animation: 'slideUp 0.3s ease-out'
                        }}
                    >
                        {mode === 'signup' ? (
                            <form onSubmit={handleSignUp} className="space-y-5">
                                {/* Display Name Field */}
                                <div className="relative group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-[#12AAFF]">
                                        Display Name
                                    </label>
                                    <div className="relative">
                                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'name' ? 'text-[#12AAFF] scale-110' : 'text-gray-400'
                                            }`}>
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 focus:outline-none focus:bg-white focus:border-[#12AAFF] transition-all duration-300 hover:border-gray-200"
                                            placeholder="Enter your creator name"
                                        />
                                    </div>
                                </div>

                                {/* Wallet Address Field */}
                                <div className="relative group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-[#12AAFF]">
                                        Wallet Address
                                    </label>
                                    <div className="relative">
                                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'wallet' ? 'text-[#12AAFF] scale-110' : 'text-gray-400'
                                            }`}>
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={walletAddress}
                                            onChange={(e) => setWalletAddress(e.target.value)}
                                            onFocus={() => setFocusedField('wallet')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 focus:outline-none focus:bg-white focus:border-[#12AAFF] transition-all duration-300 hover:border-gray-200 font-mono text-sm"
                                            placeholder="0x..."
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="w-full bg-gradient-to-r from-[#12AAFF] to-[#0088DD] text-white font-bold py-4 rounded-xl hover:from-[#0099EE] hover:to-[#0077CC] disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#12AAFF]/25 active:scale-[0.98] transform"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating Account...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            Start Creating
                                        </span>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSignIn} className="space-y-5">
                                {/* Username Field */}
                                <div className="relative group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-[#12AAFF]">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'loginUsername' ? 'text-[#12AAFF] scale-110' : 'scale-100 text-gray-400'
                                            }`}>
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={loginUsername}
                                            onChange={(e) => setLoginUsername(e.target.value)}
                                            onFocus={() => setFocusedField('loginUsername')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 focus:outline-none focus:bg-white focus:border-[#12AAFF] transition-all duration-300 hover:border-gray-200"
                                            placeholder="Enter your username"
                                        />
                                    </div>
                                </div>

                                {/* Wallet Address Field */}
                                <div className="relative group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-[#12AAFF]">
                                        Wallet Address
                                    </label>
                                    <div className="relative">
                                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'loginWallet' ? 'text-[#12AAFF] scale-110' : 'scale-100 text-gray-400'
                                            }`}>
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={loginWalletAddress}
                                            onChange={(e) => setLoginWalletAddress(e.target.value)}
                                            onFocus={() => setFocusedField('loginWallet')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 focus:outline-none focus:bg-white focus:border-[#12AAFF] transition-all duration-300 hover:border-gray-200 font-mono text-sm"
                                            placeholder="0x..."
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="w-full bg-gradient-to-r from-[#12AAFF] to-[#0088DD] text-white font-bold py-4 rounded-xl hover:from-[#0099EE] hover:to-[#0077CC] disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#12AAFF]/25 active:scale-[0.98] transform"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Signing In...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <LogIn className="w-5 h-5" />
                                            Sign In
                                        </span>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
            `}</style>
        </div>
    );
}
