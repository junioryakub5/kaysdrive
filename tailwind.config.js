/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#DC2626', // Red to match logo
                    dark: '#B91C1C',    // Darker red for hover states
                    light: '#EF4444',   // Lighter red for backgrounds
                },
                text: {
                    primary: '#1A1A1A',
                    secondary: 'rgb(106, 114, 129)',
                },
                background: {
                    DEFAULT: '#FFFFFF',
                    alt: '#F7F8FA',
                },
            },
            fontFamily: {
                sans: ['Manrope', 'sans-serif'],
            },
            borderRadius: {
                'card': '12px',
            },
        },
    },
    plugins: [],
}
