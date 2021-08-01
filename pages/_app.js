import { CSSReset, theme, ThemeProvider } from '@chakra-ui/core';
import React from 'react';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import 'styles/globals.css';
import 'styles/pattern.css';

export default function MyApp({ Component, pageProps }) {
    return (
        <ThemeProvider theme={theme}>
            <CSSReset />
            <Component {...pageProps} />
        </ThemeProvider>
    );
}
