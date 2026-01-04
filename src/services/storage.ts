const CREATOR_ID_KEY = 'arbifans_creator_id';

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
};
