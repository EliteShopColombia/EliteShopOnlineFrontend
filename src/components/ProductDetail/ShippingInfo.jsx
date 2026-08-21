import './ShippingInfo.css';

function ShippingInfo() {
    return (
        <div className="shipping-info">
            <div className="shipping-info__delivery">
                <div className="shipping-info__icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4da3ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                </div>
                <div className="shipping-info__delivery-text">
                    <strong>Enviado por el vendedor</strong>
                </div>
            </div>

            <p className="shipping-info__details">
                Estandar: <strong>$12.400</strong> o <strong>GRATIS</strong> (si pides mas de $60.000 de este vendedor), entrega rapida: 3-9 sep (30-36 dias). Normalmente, se envia en 15 dias.
            </p>

            <div className="shipping-info__platform">
                <div className="shipping-info__platform-header">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2778d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Que ofrece nuestra plataforma?</span>
                </div>
                <div className="shipping-info__benefits">
                    <div className="shipping-info__benefit-title">Seguridad y Privacidad</div>
                    <div className="shipping-info__benefit-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Privacidad de tus datos
                    </div>
                    <div className="shipping-info__benefit-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Pagos seguros
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShippingInfo;
