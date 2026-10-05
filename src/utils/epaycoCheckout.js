const EPAYCO_SDK_URL = 'https://checkout.epayco.co/checkout-v2.js';

/**
 * Modo sandbox de ePayco. Por defecto `true` (seguro para desarrollo); en
 * producción debe definirse VITE_EPAYCO_TEST=false en el entorno de build.
 */
const EPAYCO_TEST_MODE =
  String(import.meta.env.VITE_EPAYCO_TEST ?? 'true').toLowerCase() !== 'false';

let sdkLoaded = false;

function loadSdk() {
  if (sdkLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (window.ePayco) {
      sdkLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = EPAYCO_SDK_URL;
    script.async = true;
    script.onload = () => {
      sdkLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('No se pudo cargar el SDK de ePayco'));
    document.head.appendChild(script);
  });
}

export async function openEpaycoCheckout(sessionId, { onResponse, onErrors, onClosed } = {}) {
  await loadSdk();

  return new Promise((resolve, reject) => {
    const checkout = window.ePayco.checkout.configure({
      sessionId,
      test: EPAYCO_TEST_MODE,
    });

    checkout.setHooks({
      onCreated: () => {},
      onResponse: (response) => {
        onResponse?.(response);
        resolve(response);
      },
      onErrors: (error) => {
        onErrors?.(error);
        reject(new Error(error?.data?.message || 'Error en el pago'));
      },
      onClosed: () => {
        onClosed?.();
        reject(new Error('Pago cancelado'));
      },
    });

    checkout.open();
  });
}
