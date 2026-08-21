const EPAYCO_SDK_URL = 'https://checkout.epayco.co/checkout-v2.js';

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
      test: true,
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
