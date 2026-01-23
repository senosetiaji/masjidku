import "@/styles/globals.css";
import "@/styles/scss/index.scss";
import Providers from "./_providers";

export default function App({ Component, pageProps }) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
