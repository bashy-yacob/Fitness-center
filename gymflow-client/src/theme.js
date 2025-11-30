import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
    theme: {
        tokens: {
            colors: {
                brand: {
                    50: { value: '#e3f9e5' },
                    100: { value: '#c1eac5' },
                    200: { value: '#a3d9a5' },
                    300: { value: '#7bc47f' },
                    400: { value: '#5ad472' }, // Accent color
                    500: { value: '#22db47' }, // H3 Primary / Success
                    600: { value: '#0d6e20' }, // Primary color
                    700: { value: '#065014' },
                    800: { value: '#03360b' },
                    900: { value: '#012005' },
                },
                secondary: {
                    50: { value: '#fce4f7' },
                    100: { value: '#f7bce9' },
                    200: { value: '#f293db' },
                    300: { value: '#ed6acd' },
                    400: { value: '#d45abc' }, // Secondary Pink
                    500: { value: '#c918a6' }, // Accent Soft
                    600: { value: '#a01284' },
                    700: { value: '#780d63' },
                    800: { value: '#500842' },
                    900: { value: '#280421' },
                },
                dark: {
                    bg: { value: '#1a1a1a' },
                    section: { value: '#232323' },
                    card: { value: '#22282a' },
                    border: { value: '#333333' },
                },
            },
            fonts: {
                heading: { value: `'Rubik', 'Segoe UI', Arial, sans-serif` },
                body: { value: `'Heebo', 'Arial', sans-serif` },
            },
        },
    },
});

const system = createSystem(defaultConfig, customConfig);

export default system;
