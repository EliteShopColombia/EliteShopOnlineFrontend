import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sellerVerificationService, normalizeVerificationStatus } from '../../services/seller-verification.service';
import { parseApiError } from '../../helpers/api.helpers';
import './SellerVerification.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20; // 20 intentos x 3s = 60s máximo

const STATUS_META = {
  DOCUMENT_UPLOADED: { icon: '📄', label: 'Esperando selfie...', tone: 'info' },
  SELFIE_UPLOADED: { icon: '🤳', label: 'Esperando verificación...', tone: 'info' },
  PROCESSING: { icon: '⏳', label: 'Verificando tu identidad...', tone: 'info' },
  APPROVED: { icon: '✅', label: '¡Identidad verificada!', tone: 'success' },
  REJECTED: { icon: '❌', label: 'Verificación fallida', tone: 'error' },
};

const validateImage = (file) => {
  if (!file) return 'Selecciona una imagen.';
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'La imagen no es válida. Usa JPG o PNG.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'La imagen supera el máximo de 5 MB.';
  }
  return null;
};

const uploadErrorMessage = (httpStatus, serverMessage) => {
  if (httpStatus === 400) return 'La imagen no es válida. Usa JPG o PNG.';
  if (httpStatus === 404) return 'Cuenta no encontrada.';
  if (httpStatus === 409) return 'Tu identidad ya fue verificada.';
  if (httpStatus && httpStatus >= 500) return 'Error temporal. Intenta de nuevo.';
  return serverMessage || 'No se pudo subir el archivo. Intenta de nuevo.';
};

function VerifyStep({ number, icon, title, hint, done, active, children }) {
  return (
    <li
      className={`seller-verify__step${done ? ' seller-verify__step--done' : ''}${active ? ' seller-verify__step--active' : ''}`}
    >
      <div className="seller-verify__step-head">
        <span className="seller-verify__step-num" aria-hidden="true">
          {done ? '✓' : number}
        </span>
        <div className="seller-verify__step-title">
          <strong>{icon} {title}</strong>
          {hint && <span className="seller-verify__step-hint">{hint}</span>}
        </div>
        {done && <span className="seller-verify__step-badge">Hecho</span>}
      </div>
      {children}
    </li>
  );
}

function SellerVerification({ sellerId: propSellerId, onBack, onComplete }) {
  const { auth, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const sellerId = propSellerId || auth?.sellerId || localStorage.getItem('sellerId') || null;

  const [verification, setVerification] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(() => !sellerId);
  const [uploading, setUploading] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState('');
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState('');

  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const status = normalizeVerificationStatus(verification?.status);
  const rejectionReason = verification?.rejectionReason || verification?.reason || verification?.message || '';

  const previewsRef = useRef({ document: null, selfie: null });
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const pollTimerRef = useRef(null);
  const pollActiveRef = useRef(false);
  const pollAttemptsRef = useRef(0);
  const pollOnceRef = useRef(null);

  /* ---------- helpers ---------- */

  const revokePreview = useCallback((field) => {
    if (previewsRef.current[field]) {
      URL.revokeObjectURL(previewsRef.current[field]);
      previewsRef.current[field] = null;
    }
  }, []);

  const clearStepFile = useCallback((field) => {
    revokePreview(field);
    if (field === 'document') {
      setDocumentFile(null);
      setDocumentPreview('');
    } else {
      setSelfieFile(null);
      setSelfiePreview('');
    }
  }, [revokePreview]);

  const setStepFile = useCallback((field, file) => {
    const invalid = validateImage(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    revokePreview(field);
    const url = URL.createObjectURL(file);
    previewsRef.current[field] = url;
    if (field === 'document') {
      setDocumentFile(file);
      setDocumentPreview(url);
    } else {
      setSelfieFile(file);
      setSelfiePreview(url);
    }
    setError('');
    setNotice('');
  }, [revokePreview]);

  /* ---------- cámara (selfie) ---------- */

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCapturing(false);
  }, []);

  const openCamera = useCallback(async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Tu navegador no soporta acceso a la cámara. Puedes subir una foto desde tu galería.');
      return;
    }
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCapturing(true);
    } catch {
      setCameraError('No se pudo acceder a la cámara. Revisa los permisos o sube una foto desde tu galería.');
    }
  }, [stopCamera]);

  useEffect(() => {
    if (capturing && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {
        setCameraError('No se pudo iniciar la cámara. Sube una foto desde tu galería.');
      });
    }
  }, [capturing]);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
      stopCamera();
      setStepFile('selfie', file);
    }, 'image/jpeg', 0.92);
  };

  /* ---------- polling ---------- */

  const stopPolling = useCallback(() => {
    pollActiveRef.current = false;
    pollAttemptsRef.current = 0;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const pollOnce = useCallback(async () => {
    if (!pollActiveRef.current) return;

    if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
      stopPolling();
      setTimedOut(true);
      setError('No se obtuvo respuesta. Intenta de nuevo más tarde.');
      return;
    }

    try {
      const data = await sellerVerificationService.getStatus(sellerId);
      if (!pollActiveRef.current) return;

      const next = normalizeVerificationStatus(data?.status);
      setVerification(data);

      if (next === 'APPROVED' || next === 'REJECTED') {
        stopPolling();
        setNotice(next === 'APPROVED' ? '¡Identidad verificada!' : 'La verificación fue rechazada. Puedes reintentar.');
        return;
      }

      pollAttemptsRef.current += 1;
      pollTimerRef.current = setTimeout(() => pollOnceRef.current?.(), POLL_INTERVAL_MS);
    } catch (err) {
      if (!pollActiveRef.current) return;

      const { status: httpStatus } = parseApiError(err);
      if (httpStatus === 403) {
        stopPolling();
        navigate('/login');
        return;
      }
      if (httpStatus === 404) {
        stopPolling();
        setVerification(null);
        setNotice('No se encontró una verificación activa.');
        return;
      }

      // Error transitorio: se sigue consultando hasta agotar los intentos
      pollAttemptsRef.current += 1;
      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        stopPolling();
        setTimedOut(true);
        setError('No se obtuvo respuesta. Intenta de nuevo más tarde.');
        return;
      }
      pollTimerRef.current = setTimeout(() => pollOnceRef.current?.(), POLL_INTERVAL_MS);
    }
  }, [sellerId, navigate, stopPolling]);

  // Mantiene la referencia al callback más reciente para el bucle recursivo
  useEffect(() => {
    pollOnceRef.current = pollOnce;
  });

  const startPolling = useCallback(() => {
    stopPolling();
    pollActiveRef.current = true;
    pollAttemptsRef.current = 0;
    setTimedOut(false);
    setError('');
    setNotice('');
    setIsPolling(true);
    pollTimerRef.current = setTimeout(() => pollOnceRef.current?.(), 0);
  }, [stopPolling]);

  const handleValidate = async () => {
    if (!sellerId || isPolling || uploading) return;
    setError('');
    setNotice('');
    setTimedOut(false);
    setIsPolling(true);

    try {
      const data = await sellerVerificationService.validate(sellerId);
      if (!pollActiveRef.current) return; // el usuario canceló mientras se enviaba
      setVerification(data);
      if (normalizeVerificationStatus(data?.status) === 'APPROVED') {
        stopPolling();
        return;
      }
      // responde 202 -> entra en modo polling
      startPolling();
    } catch (err) {
      const { status: httpStatus, error: serverMessage } = parseApiError(err);
      if (httpStatus === 403) {
        stopPolling();
        navigate('/login');
        return;
      }
      if (httpStatus === 404) {
        stopPolling();
        setError('Cuenta no encontrada.');
        return;
      }
      if (httpStatus === 409) {
        stopPolling();
        try {
          const data = await sellerVerificationService.getStatus(sellerId);
          setVerification(data);
          setNotice(normalizeVerificationStatus(data?.status) === 'APPROVED'
            ? 'Tu identidad ya fue verificada.'
            : 'Ya existe una verificación en curso.');
        } catch {
          setError('Tu identidad ya fue verificada.');
        }
        return;
      }
      stopPolling();
      setError(serverMessage || 'No se pudo iniciar la verificación. Intenta de nuevo.');
    }
  };

  const cancelPolling = () => {
    stopPolling();
    setNotice('Verificación en segundo plano. Puedes volver a consultar en unos minutos.');
  };

  /* ---------- load inicial ---------- */

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!sellerId) {
      return; // loadingStatus ya nace en false cuando no hay sellerId
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await sellerVerificationService.getStatus(sellerId);
        if (cancelled) return;
        setVerification(data);
        const next = normalizeVerificationStatus(data?.status);
        if (next === 'PROCESSING') {
          // Retomar el polling si la verificación quedó en proceso
          startPolling();
        }
      } catch (err) {
        const { status: httpStatus } = parseApiError(err);
        if (cancelled) return;
        if (httpStatus === 403) {
          navigate('/login');
          return;
        }
        // 404 o cualquier otro: sin verificación iniciada aún
        setVerification(null);
      } finally {
        if (!cancelled) setLoadingStatus(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, sellerId, navigate, startPolling]);

  /* ---------- uploads ---------- */

  const handleUpload = async (field) => {
    const file = field === 'document' ? documentFile : selfieFile;
    if (!file || !sellerId) return;

    setUploading(field);
    setError('');
    setNotice('');

    try {
      const data = field === 'document'
        ? await sellerVerificationService.uploadDocument(sellerId, file)
        : await sellerVerificationService.uploadSelfie(sellerId, file);
      clearStepFile(field);
      setVerification(data);
      setNotice(field === 'document'
        ? 'Cédula subida correctamente. Ahora sube tu selfie.'
        : 'Selfie subida correctamente. Ya puedes verificar tu identidad.');
    } catch (err) {
      const { status: httpStatus, error: serverMessage } = parseApiError(err);
      if (httpStatus === 403) {
        navigate('/login');
        return;
      }
      setError(uploadErrorMessage(httpStatus, serverMessage));
    } finally {
      setUploading('');
    }
  };

  const handleDocumentInput = (event) => {
    const file = event.target.files?.[0];
    if (file) setStepFile('document', file);
    event.target.value = '';
  };

  const handleSelfieInput = (event) => {
    const file = event.target.files?.[0];
    if (file) setStepFile('selfie', file);
    event.target.value = '';
  };

  /* ---------- limpieza al desmontar ---------- */

  useEffect(() => {
    return () => {
      pollActiveRef.current = false;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      stopCamera();
      revokePreview('document');
      revokePreview('selfie');
    };
  }, [stopCamera, revokePreview]);

  /* ---------- estado derivado ---------- */

  const step1Done = status !== null; // cualquier estado implica cédula subida
  const step2Done = ['SELFIE_UPLOADED', 'PROCESSING', 'APPROVED', 'REJECTED'].includes(status);
  const step3Done = status === 'APPROVED' || status === 'REJECTED';
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';
  const step3Locked = !step2Done || !!uploading || isPolling || isApproved;
  const statusMeta = STATUS_META[status];

  /* ---------- render ---------- */

  if (!isAuthenticated) return null;

  return (
    <div className="seller-verify">
      <div className="seller-verify__container">
        <div className="seller-verify__top">
          <button type="button" className="seller-verify__back" onClick={onBack}>
            ← Volver
          </button>
          <h1 className="seller-verify__title">Verifica tu identidad</h1>
          <p className="seller-verify__subtitle">
            Para vender en EliteShop necesitas completar los 3 pasos de verificación de identidad.
            Solo se aceptan imágenes JPG o PNG de máximo 5 MB.
          </p>
        </div>

        {!sellerId ? (
          <div className="seller-verify__panel" role="alert">
            <p className="seller-verify__panel-title">No tienes una cuenta de vendedor activa</p>
            <p className="seller-verify__muted">
              Regístrate como vendedor para poder verificar tu identidad.
            </p>
          </div>
        ) : loadingStatus ? (
          <div className="seller-verify__panel">
            <div className="seller-verify__spinner" aria-hidden="true" />
            <p className="seller-verify__muted">Consultando estado de verificación...</p>
          </div>
        ) : (
          <>
            <div className="seller-verify__status" role="status" aria-live="polite">
              {statusMeta ? (
                <>
                  <span aria-hidden="true">{statusMeta.icon}</span>
                  <span>
                    <strong>{statusMeta.label}</strong>
                    {isRejected && (rejectionReason ? `: ${rejectionReason}` : ' Intenta de nuevo.')}
                  </span>
                </>
              ) : (
                <span>Sin verificación iniciada. <strong>Paso 1:</strong> sube tu cédula.</span>
              )}
            </div>

            {error && <div className="seller-verify__error" role="alert">{error}</div>}
            {notice && <div className="seller-verify__notice" role="status">{notice}</div>}

            <ol className="seller-verify__steps">
              {/* Paso 1: cédula */}
              <VerifyStep
                number="1"
                icon="📄"
                title="Subir cédula"
                hint="Foto del documento de identidad (JPG/PNG, máx. 5 MB)"
                done={step1Done}
                active={!step1Done}
              >
                {isApproved ? (
                  <p className="seller-verify__muted">Documento aprobado.</p>
                ) : uploading === 'document' ? (
                  <div className="seller-verify__uploading">
                    <div className="seller-verify__spinner" aria-hidden="true" />
                    <span>Subiendo cédula...</span>
                  </div>
                ) : documentPreview ? (
                  <div className="seller-verify__preview">
                    <img src={documentPreview} alt="Vista previa de la cédula" />
                    <div className="seller-verify__preview-actions">
                      <button
                        type="button"
                        className="seller-verify__btn seller-verify__btn--primary"
                        onClick={() => handleUpload('document')}
                        disabled={!!uploading || isPolling}
                      >
                        Subir cédula
                      </button>
                      <button
                        type="button"
                        className="seller-verify__btn seller-verify__btn--ghost"
                        onClick={() => clearStepFile('document')}
                        disabled={!!uploading || isPolling}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="sv-document-input"
                      className="seller-verify__file-input"
                      accept="image/jpeg,image/png"
                      onChange={handleDocumentInput}
                      disabled={!!uploading || isPolling}
                    />
                    <label
                      htmlFor="sv-document-input"
                      className="seller-verify__btn seller-verify__btn--primary seller-verify__file-label"
                    >
                      Subir cédula
                    </label>
                    <p className="seller-verify__muted">Verás una vista previa antes de enviar.</p>
                  </>
                )}
              </VerifyStep>

              {/* Paso 2: selfie */}
              <VerifyStep
                number="2"
                icon="🤳"
                title="Subir selfie"
                hint="Selfie de tu rostro con cámara frontal o desde tu galería"
                done={step2Done}
                active={!step2Done && step1Done}
              >
                {isApproved ? (
                  <p className="seller-verify__muted">Selfie aprobada.</p>
                ) : capturing ? (
                  <div className="seller-verify__camera" aria-live="polite">
                    <video
                      ref={videoRef}
                      className="seller-verify__video"
                      autoPlay
                      playsInline
                      muted
                    />
                    <div className="seller-verify__camera-actions">
                      <button
                        type="button"
                        className="seller-verify__btn seller-verify__btn--primary"
                        onClick={capturePhoto}
                      >
                        Capturar
                      </button>
                      <button
                        type="button"
                        className="seller-verify__btn seller-verify__btn--ghost"
                        onClick={stopCamera}
                      >
                        Cancelar
                      </button>
                    </div>
                    <p className="seller-verify__tip">Mira a la cámara, en un lugar bien iluminado y con fondo claro.</p>
                  </div>
                ) : uploading === 'selfie' ? (
                  <div className="seller-verify__uploading">
                    <div className="seller-verify__spinner" aria-hidden="true" />
                    <span>Subiendo selfie...</span>
                  </div>
                ) : selfiePreview ? (
                  <div className="seller-verify__preview">
                    <img src={selfiePreview} alt="Vista previa de la selfie" />
                    <div className="seller-verify__preview-actions">
                      <button
                        type="button"
                        className="seller-verify__btn seller-verify__btn--primary"
                        onClick={() => handleUpload('selfie')}
                        disabled={!!uploading || isPolling}
                      >
                        Subir selfie
                      </button>
                      <button
                        type="button"
                        className="seller-verify__btn seller-verify__btn--ghost"
                        onClick={() => clearStepFile('selfie')}
                        disabled={!!uploading || isPolling}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="seller-verify__selfie-actions">
                      <button
                        type="button"
                        className="seller-verify__btn seller-verify__btn--primary"
                        onClick={openCamera}
                        disabled={!step1Done || !!uploading || isPolling || isApproved}
                      >
                        Tomar selfie
                      </button>
                      <input
                        type="file"
                        id="sv-selfie-input"
                        className="seller-verify__file-input"
                        accept="image/jpeg,image/png"
                        onChange={handleSelfieInput}
                        disabled={!step1Done || !!uploading || isPolling || isApproved}
                      />
                      <label
                        htmlFor="sv-selfie-input"
                        className={`seller-verify__btn seller-verify__btn--ghost seller-verify__file-label${(!step1Done || !!uploading || isPolling || isApproved) ? ' seller-verify__btn--disabled' : ''}`}
                      >
                        Subir desde galería
                      </label>
                    </div>
                    {cameraError && <p className="seller-verify__error" role="alert">{cameraError}</p>}
                    {!step1Done && <p className="seller-verify__muted">Primero sube tu cédula.</p>}
                    <ul className="seller-verify__tips">
                      <li>Usa la cámara frontal</li>
                      <li>Mira directamente a la cámara</li>
                      <li>Buena iluminación y fondo claro</li>
                      <li>Sin gafas si es posible</li>
                    </ul>
                  </>
                )}
              </VerifyStep>

              {/* Paso 3: verificar */}
              <VerifyStep
                number="3"
                icon="🔍"
                title="Verificar"
                hint="Dispara la validación biométrica y consulta el resultado"
                done={step3Done}
                active={!step3Done && step2Done}
              >
                {isApproved ? (
                  <div className="seller-verify__result seller-verify__result--success" role="status">
                    <span className="seller-verify__result-icon" aria-hidden="true">✅</span>
                    <div>
                      <strong>¡Identidad verificada!</strong>
                      <p className="seller-verify__muted">Ya puedes vender tus productos en EliteShop.</p>
                    </div>
                  </div>
                ) : isRejected ? (
                  <div className="seller-verify__result seller-verify__result--error" role="alert">
                    <span className="seller-verify__result-icon" aria-hidden="true">❌</span>
                    <div>
                      <strong>Verificación fallida{rejectionReason ? `: ${rejectionReason}` : ''}</strong>
                      <p className="seller-verify__muted">
                        Revisa que tus fotos sean nítidas. Puedes volver a subirlas en los pasos 1 y 2,
                        o reintentar la verificación.
                      </p>
                      <button
                        type="button"
                        className="seller-verify__btn seller-verify__btn--primary"
                        onClick={handleValidate}
                        disabled={!!uploading || isPolling}
                      >
                        Reintentar verificación
                      </button>
                    </div>
                  </div>
                ) : timedOut ? (
                  <div className="seller-verify__panel" role="alert">
                    <p className="seller-verify__panel-title">No se obtuvo respuesta</p>
                    <p className="seller-verify__muted">Intenta de nuevo más tarde.</p>
                    <button
                      type="button"
                      className="seller-verify__btn seller-verify__btn--primary"
                      onClick={handleValidate}
                      disabled={!!uploading || step3Locked}
                    >
                      Reintentar
                    </button>
                  </div>
                ) : isPolling ? (
                  <div className="seller-verify__panel seller-verify__panel--processing" aria-live="polite">
                    <div className="seller-verify__spinner" aria-hidden="true" />
                    <p className="seller-verify__panel-title">⏳ Verificando tu identidad</p>
                    <p className="seller-verify__muted">Esto puede tomar unos segundos...</p>
                    <button
                      type="button"
                      className="seller-verify__btn seller-verify__btn--ghost"
                      onClick={cancelPolling}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="seller-verify__validate">
                    <button
                      type="button"
                      className="seller-verify__btn seller-verify__btn--primary seller-verify__btn--lg"
                      onClick={handleValidate}
                      disabled={step3Locked}
                    >
                      Verificar identidad
                    </button>
                  </div>
                )}

                {!step3Done && isPolling && (
                  <p className="seller-verify__muted">
                    Puedes cerrar esta página; tu verificación continuará en segundo plano.
                  </p>
                )}
              </VerifyStep>
            </ol>

            <div className="seller-verify__footer">
              <button type="button" className="seller-verify__btn seller-verify__btn--ghost" onClick={onBack}>
                Volver al panel
              </button>
              {isApproved && (
                <button
                  type="button"
                  className="seller-verify__btn seller-verify__btn--primary"
                  onClick={onComplete}
                >
                  Ir a mi panel de ventas
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SellerVerification;