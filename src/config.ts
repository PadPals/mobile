import { Platform } from 'react-native';

/**
 * Global configuration for the PadPals app.
 * Change the BASE_URL to point to your live API when ready.
 */
const CONFIG = {
    // API Base URL - Live Production Server
    BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || 'https://api.padpals.co.za/api',

    // Assets URL for images
    ASSETS_URL: process.env.EXPO_PUBLIC_ASSETS_URL || 'https://api.padpals.co.za',

    // Auth settings
    TOKEN_KEY: 'padpals_user_token',
    USER_KEY: 'padpals_user_data',
};

export default CONFIG;
