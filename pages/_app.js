import "@/styles/globals.css";
import "@/styles/scss/index.scss";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import Providers from "./_providers";

export default function App({ Component, pageProps }) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
