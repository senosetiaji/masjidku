import React from 'react';

export default function useCryptoReady() {
  const [ready, setReady] = React.useState(
    typeof window !== 'undefined' ? globalThis.__wasmInitReduxReady === true : false
  );

  React.useEffect(() => {
    const onReady = () => setReady(true);
    const onError = () => setReady(false);
    if (typeof window !== 'undefined') {
      window.addEventListener('crypto-ready', onReady);
      window.addEventListener('crypto-error', onError);
      if (globalThis.__wasmInitReduxReady === true) setReady(true);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('crypto-ready', onReady);
        window.removeEventListener('crypto-error', onError);
      }
    };
  }, []);

  return ready;
}
