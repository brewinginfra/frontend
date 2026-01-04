import { API_BASE_URL } from '../config';

interface ApiResponse<T> {
    data: T;
    error?: string;
}

interface RegisterCreatorPayload {
    name: string;
    walletAddress: string;
}

interface RegisterCreatorResponse {
    id: number;
}

interface SubmitAssetPayload {
    creatorId: number;
    url: string;
    price: number;
    description: string;
    unlockableContent: boolean;
}

export interface Asset {
    id: number;
    creatorId: number;
    Url: string;
    price: number;
    description: string;
    unlockableContent?: boolean;
}

export interface CreatorProfile {
    id: number;
    name: string;
    walletAddress: string;
}

const headers = {
    'Content-Type': 'application/json',
};

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error ${response.status}: ${errorBody}`);
    }
    return response.json();
}

export const api = {
    async registerCreator(name: string, walletAddress: string): Promise<RegisterCreatorResponse> {
        const response = await fetch(`${API_BASE_URL}/api/creator/register`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name, walletAddress }),
        });
        return handleResponse<RegisterCreatorResponse>(response);
    },

    /**
     * Find an existing creator by wallet address, or create a new one if not found.
     * This provides idempotency - calling this multiple times with the same wallet
     * will always return the same creator record.
     */
    async findOrCreateCreator(name: string, walletAddress: string): Promise<RegisterCreatorResponse> {
        // First, try to find existing creator by wallet address
        try {
            const findResponse = await fetch(`${API_BASE_URL}/api/creator/find-by-wallet/${walletAddress}`, {
                method: 'GET',
                headers,
            });

            if (findResponse.ok) {
                const existingCreator = await findResponse.json();
                return { id: existingCreator.id };
            }

            // If 404, creator doesn't exist - fall through to registration
            if (findResponse.status !== 404) {
                // Some other error occurred
                const errorBody = await findResponse.text();
                console.warn('Find creator failed, attempting registration:', errorBody);
            }
        } catch (err) {
            // Network error or other issue - try registration
            console.warn('Find creator request failed, attempting registration:', err);
        }

        // Creator not found, register a new one
        const registerResponse = await fetch(`${API_BASE_URL}/api/creator/register`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name, walletAddress }),
        });

        // Handle case where creator was created by another request between find and register
        if (registerResponse.status === 409) {
            // Conflict - creator already exists, try to find again
            const retryFindResponse = await fetch(`${API_BASE_URL}/api/creator/find-by-wallet/${walletAddress}`, {
                method: 'GET',
                headers,
            });
            if (retryFindResponse.ok) {
                const existingCreator = await retryFindResponse.json();
                return { id: existingCreator.id };
            }
        }

        return handleResponse<RegisterCreatorResponse>(registerResponse);
    },

    async submitAsset(payload: SubmitAssetPayload): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/creator/assets`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });
        return handleResponse<void>(response);
    },

    async getAssets(): Promise<Asset[]> {
        const response = await fetch(`${API_BASE_URL}/api/creator/assets`, {
            method: 'GET',
            headers,
        });
        return handleResponse<Asset[]>(response);
    },

    async getAssetById(id: number | string): Promise<Asset> {
        const response = await fetch(`${API_BASE_URL}/api/creator/assets/${id}`, {
            method: 'GET',
            headers,
        });
        return handleResponse<Asset>(response);
    },

    async getPurchaseAsset(id: number | string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/api/creator/assets/${id}/purchase`, {
            method: 'GET',
            headers,
        });

        // Handle 402 Payment Required specifically
        if (response.status === 402) {
            return response.json();
        }

        return handleResponse<void>(response);
    },

    async postVerifyAsset(id: number | string, REQUIRED_AMOUNT_USDT: string, RECEIVER_ADDRESS: string, txHash: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/creator/assets/${id}/verify`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ REQUIRED_AMOUNT_USDT, RECEIVER_ADDRESS, txHash }),
        });
        return handleResponse<void>(response);
    },

    async loginCreator(username: string, walletAddress: string): Promise<{ creatorId: number }> {
        const response = await fetch(`${API_BASE_URL}/api/creator/login`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ username, walletAddress }),
        });
        return handleResponse<{ creatorId: number }>(response);
    },

    async getCreatorProfile(id: number | string): Promise<CreatorProfile> {
        const response = await fetch(`${API_BASE_URL}/api/creator/register/${id}`, {
            method: 'GET',
            headers,
        });
        return handleResponse<CreatorProfile>(response);
    },

    async updateCreatorProfile(id: number | string, name: string): Promise<CreatorProfile> {
        const response = await fetch(`${API_BASE_URL}/api/creator/register/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ name }),
        });
        return handleResponse<CreatorProfile>(response);
    },
};
