import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
        screens: {
        'xs': '400px', // Add this custom breakpoint
      },
      fontFamily: {
        heading: ['"Minork Sans"', 'sans-serif'],

        body: ['"Kodchasan"', 'sans-serif'],
      },
      
colors: {
        "sidebar-accent": "#232d35",
        "accent-foreground": "#e4bc84",
      },
      fontWeight: {
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
    },
  },
  plugins: [],
};

export default config;
