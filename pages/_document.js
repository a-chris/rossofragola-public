import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class CustomDocument extends Document {
    render() {
        return (
            <Html lang='it'>
                <Head title='Rosso Fragola'>
                    <link rel='icon' href='/favicon.png' />
                    <link
                        rel='preload'
                        href='/fonts/OpenSansCondensed-Light.ttf'
                        as='font'
                        type='font/ttf'
                        crossOrigin=''
                    />
                    <link
                        rel='preload'
                        href='/fonts/JustAnotherHand-Regular.ttf'
                        as='font'
                        type='font/ttf'
                        crossOrigin=''
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
