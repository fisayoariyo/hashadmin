/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#155235",
          "green-dark": "#0d3d27",
          "green-light": "#1a6645",
          "green-muted": "#e8f4ee",
          amber: "#d4900a",
          "amber-light": "#f5a623",
          cream: "#faf9f6",
          text: {
            primary: "#111827",
            secondary: "#6b7280",
            muted: "#9ca3af",
            inverse: "#ffffff",
          },
          border: "#e5e7eb",
          "bg-page": "#f2f2f0",
          sidebar: "#0d3d27",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.06)",
        "card-lg": "0 4px 24px rgba(0,0,0,0.10)",
        nav: "0 -2px 16px rgba(0,0,0,0.08)",
        sidebar: "2px 0 16px rgba(0,0,0,0.12)",
      },
      screens: {
        xs: "375px",
      },
      maxWidth: {
        "mobile": "480px",
        "role": "600px",
      },
    },
  },
  plugins: [],
};
