import '../path/to/globals.css';
import RootLayout from '../path/to/RootLayout';

function MyApp({ Component, pageProps }) {
    return (
        <RootLayout>
            <Component {...pageProps} />
        </RootLayout>
    );
}

export default MyApp;
