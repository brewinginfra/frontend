import { useEffect, useState, useCallback } from 'react';
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';
import { api } from '../services/api';
import { storage } from '../services/storage';

interface UseAutoRegisterCreatorResult {
    isRegistering: boolean;
    isRegistered: boolean;
    error: string | null;
    creatorId: number | null;
    retry: () => void;
}

/**
 * Custom hook that automatically registers or logs in a user to the backend
 * when they authenticate via Privy.
 * 
 * This hook:
 * 1. Detects when a user successfully authenticates with Privy
 * 2. Extracts their wallet address (from embedded wallet) and email/name
 * 3. Calls the backend to register them (or retrieve existing record)
 * 4. Stores the creatorId in localStorage for future use
 * 
 * Idempotency is handled by the backend - if the wallet already exists,
 * it returns the existing creator record instead of creating a duplicate.
 */
export function useAutoRegisterCreator(): UseAutoRegisterCreatorResult {
    const { authenticated, user, ready } = usePrivy();
    const { wallets } = useWallets();
    const embeddedWallet = getEmbeddedConnectedWallet(wallets);

    const [isRegistering, setIsRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [creatorId, setCreatorId] = useState<number | null>(null);
    const [hasAttempted, setHasAttempted] = useState(false);

    /**
     * Generate a display name from Privy user data
     */
    const generateDisplayName = useCallback((): string => {
        if (!user) return 'Anonymous Creator';

        // Try to get name from various sources in order of preference
        if (user.google?.name) return user.google.name;
        if (user.twitter?.name) return user.twitter.name;
        if (user.twitter?.username) return `@${user.twitter.username}`;
        if (user.email?.address) {
            // Extract username from email
            const emailUsername = user.email.address.split('@')[0];
            return emailUsername;
        }
        if (user.wallet?.address) {
            // Use shortened wallet address as name
            const addr = user.wallet.address;
            return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
        }

        return 'Anonymous Creator';
    }, [user]);

    /**
     * Main registration logic
     */
    const registerCreator = useCallback(async () => {
        // Check if we already have a creatorId stored
        const existingCreatorId = storage.getCreatorId();
        if (existingCreatorId) {
            setCreatorId(Number(existingCreatorId));
            setIsRegistered(true);
            return;
        }

        // Need wallet address to register
        const walletAddress = embeddedWallet?.address;
        if (!walletAddress) {
            // Wallet might not be ready yet, don't set error - we'll retry
            return;
        }

        setIsRegistering(true);
        setError(null);

        try {
            const displayName = generateDisplayName();

            // Try to find or create the creator
            // First, try to register (backend should handle idempotency)
            const response = await api.findOrCreateCreator(displayName, walletAddress);

            // Save the creator ID
            storage.saveCreatorId(response.id);
            setCreatorId(response.id);
            setIsRegistered(true);
            setHasAttempted(true);

            console.log('[useAutoRegisterCreator] Successfully registered/found creator:', response.id);
        } catch (err: any) {
            console.error('[useAutoRegisterCreator] Failed to register creator:', err);
            setError(err.message || 'Failed to register creator');
            setHasAttempted(true);
        } finally {
            setIsRegistering(false);
        }
    }, [embeddedWallet?.address, generateDisplayName]);

    /**
     * Retry registration (useful for manual retry after error)
     */
    const retry = useCallback(() => {
        setError(null);
        setHasAttempted(false);
        registerCreator();
    }, [registerCreator]);

    /**
     * Effect: Trigger registration when user is authenticated and wallet is available
     */
    useEffect(() => {
        // Wait for Privy to be ready
        if (!ready) return;

        // Only proceed if user is authenticated
        if (!authenticated) {
            // User logged out - clear state
            setIsRegistered(false);
            setCreatorId(null);
            setError(null);
            setHasAttempted(false);
            return;
        }

        // Check if already registered in this session
        if (isRegistered || isRegistering) return;

        // Check if we already have a stored creatorId
        const existingId = storage.getCreatorId();
        if (existingId) {
            setCreatorId(Number(existingId));
            setIsRegistered(true);
            return;
        }

        // Wait for wallet to be available before attempting registration
        if (!embeddedWallet?.address) return;

        // Don't retry if we've already attempted and failed
        if (hasAttempted && error) return;

        // Trigger registration
        registerCreator();
    }, [
        ready,
        authenticated,
        embeddedWallet?.address,
        isRegistered,
        isRegistering,
        hasAttempted,
        error,
        registerCreator
    ]);

    return {
        isRegistering,
        isRegistered,
        error,
        creatorId,
        retry
    };
}
