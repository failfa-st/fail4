import { Roboto } from "next/font/google";
import { experimental_extendTheme as extendTheme } from "@mui/material/styles";

export const roboto = Roboto({
	weight: ["300", "400", "500", "700"],
	subsets: ["latin"],
	display: "swap",
	fallback: ["Helvetica", "Arial", "sans-serif"],
});

// Create a theme instance.
const theme = extendTheme({
	colorSchemes: {
		light: {
			palette: {
				primary: {
					main: "#40088d",
				},
				secondary: {
					main: "#038225",
				},
			},
		},
		dark: {
			palette: {
				primary: {
					main: "#00d720",
				},
				secondary: {
					main: "#cc06ed",
				},
			},
		},
	},
	typography: {
		...roboto.style,
	},
});

export default theme;
