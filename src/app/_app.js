import '../path/to/globals.css';
import RootLayout from '../path/to/RootLayout';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
    return (
        <AuthProvider>
            <RootLayout>
                <p>test</p>
                <Component {...pageProps} />
            </RootLayout>
        </AuthProvider>
    );
}

export default MyApp;
