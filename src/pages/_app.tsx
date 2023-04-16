import Head from "next/head";
import { AppProps } from "next/app";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "@/lib/createEmotionCache";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import theme from "@/lib/theme";

const clientSideEmotionCache = createEmotionCache();

export interface MyAppProps extends AppProps {
	emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
	const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
	return (
		<CacheProvider value={emotionCache}>
			<Head>
				<meta name="viewport" content="initial-scale=1, width=device-width" />
			</Head>
			<CssVarsProvider defaultMode="system" theme={theme}>
				<Component {...pageProps} />
			</CssVarsProvider>
		</CacheProvider>
	);
}
