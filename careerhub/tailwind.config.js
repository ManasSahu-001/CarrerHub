/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0f",
          2: "#3d3d50",
          3: "#8888a0",
        },
        paper: {
          DEFAULT: "#f5f5fa",
          2: "#ebebf5",
          3: "#d8d8e8",
        },
        accent: {
          DEFAULT: "#4f46e5",
          2: "#818cf8",
          pale: "#eef2ff",
          dark: "#4338ca",
        },
        ch: {
          pink: "#e11d74",
          "pink-pale": "#fdf0f6",
          violet: "#7c3aed",
          "violet-pale": "#f3eeff",
          navy: "#0f172a",
          "navy-2": "#1e293b",
          teal: "#0891b2",
          "teal-pale": "#ecfeff",
        },
        brand: {
          green: "#059669",
          "green-pale": "#ecfdf5",
          blue: "#2563eb",
          "blue-pale": "#eff6ff",
          red: "#dc2626",
          "red-pale": "#fef2f2",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'Syne'", "'Plus Jakarta Sans'", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "14px",
        lg: "22px",
        xl: "32px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(15,23,42,0.07), 0 1px 2px rgba(15,23,42,0.04)",
        md: "0 4px 20px rgba(15,23,42,0.09), 0 2px 8px rgba(15,23,42,0.05)",
        lg: "0 16px 48px rgba(15,23,42,0.14)",
        glow: "0 0 24px rgba(79,70,229,0.18)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #e11d74 100%)",
        "gradient-card": "linear-gradient(135deg, #f5f5fa 0%, #ebebf5 100%)",
      },
    },
  },
  plugins: [],
};
