import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

export const roboto = Roboto({
	weight: ["300", "400", "500", "700"],
	subsets: ["latin"],
	display: "swap",
	fallback: ["Helvetica", "Arial", "sans-serif"],
});

// Create a theme instance.
const theme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#00d720",
		},
		secondary: {
			main: "#cc06ed",
		},
		error: {
			main: red.A400,
		},
	},
	typography: {
		...roboto.style,
	},
});

export default theme;
