/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		fontFamily: {
			primary: "Playfair Display",
			body: "Work Sans",
		},

		extend: {
			content: {
				about: 'url("/src/assets/img/outline-text/about.svg")',
			},
			colors: {
				background: "#ECF0F3",
				primary: "#c7081e", // updated to match the provided red color
				primarylight: "#FAD1D5", // lighter variant of primary
				secondary: "#1C1D24",
				card: "#FFFFFF",

				muted: {
					DEFAULT: "hsl(240 4.8% 95.9%)",
					foreground: "hsl(240 3.8% 46.1%)",
				},

				hint: "#605E5E",
				darkhint: "#B0B5BE",

				tertiary: "#131419",

				dark: "#22242F",
				light: "#ECF0F3",

				xdarkshadow: "#373C45",
				ydarkshadow: "#181920",

				xlightshadow: "#A3B1C6",
				ylightshadow: "#FFFFFF",

				accent: {
					DEFAULT: "#ac6b34",
					hover: "#925a2b",
				},
				paragraph: "#878e99",
			},
		},
	},
	plugins: [],
};
