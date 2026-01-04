const CREATOR_ID_KEY = 'arbifans_creator_id';
const UNLOCKED_ASSETS_KEY = 'arbifans_unlocked_assets';

export const storage = {
    saveCreatorId(id: number | string): void {
        localStorage.setItem(CREATOR_ID_KEY, String(id));
    },

    getCreatorId(): string | null {
        return localStorage.getItem(CREATOR_ID_KEY);
    },

    clearCreatorId(): void {
        localStorage.removeItem(CREATOR_ID_KEY);
    },

    // Unlocked Assets Management
    getUnlockedAssets(): Set<number> {
        try {
            const stored = localStorage.getItem(UNLOCKED_ASSETS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return new Set(parsed);
            }
        } catch (e) {
            console.error('Failed to parse unlocked assets from localStorage', e);
        }
        return new Set();
    },

    saveUnlockedAsset(assetId: number): void {
        const unlocked = this.getUnlockedAssets();
        unlocked.add(assetId);
        localStorage.setItem(UNLOCKED_ASSETS_KEY, JSON.stringify([...unlocked]));
    },

    isAssetUnlocked(assetId: number): boolean {
        const unlocked = this.getUnlockedAssets();
        return unlocked.has(assetId);
    }
};
