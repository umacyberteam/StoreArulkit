import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink:"#101426", violet:"#7657f6", paper:"#f7f8fc" }, boxShadow: { soft:"0 12px 40px rgba(22,26,55,.07)" } } },
  plugins: []
};
export default config;