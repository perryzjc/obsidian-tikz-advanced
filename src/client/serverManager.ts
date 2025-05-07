import { requestUrl } from 'obsidian';
import { TikZAdvancedSettings } from './settings';

/**
 * Simple class to manage the connection to the TikZ server
 */
export class ServerManager {
    private serverUrl: string = '';

    constructor(settings: TikZAdvancedSettings) {
        this.serverUrl = settings.serverUrl || 'http://localhost:3000';
    }

    /**
     * Test if the server is running
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await requestUrl({
                url: `${this.serverUrl}/health`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.status === 200;
        } catch (error) {
            console.error('TikZ Server connection error:', error);
            return false;
        }
    }

    /**
     * Get the server URL
     */
    getServerUrl(): string {
        return this.serverUrl;
    }

    /**
     * Update the server URL
     */
    setServerUrl(url: string): void {
        this.serverUrl = url;
    }
    
    /**
     * Clean up resources when shutting down
     */
    shutdown(): void {
        // No resources to clean up for now, but this method can be extended
        // if we add features that require cleanup in the future
    }
}
