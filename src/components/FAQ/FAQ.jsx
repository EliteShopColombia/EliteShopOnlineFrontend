import { useState, useCallback } from "react";
import "./FAQ.css";

/* ------------------------------------------------------------------ */
/*  Data: Términos y Condiciones                                       */
/* ------------------------------------------------------------------ */
const TERMS_DATA = [
  {
    id: "tc-1",
    question: "1. Aceptación de los Términos",
    answer:
      "Al acceder y utilizar EliteShop Colombia, usted acepta los presentes Términos y Condiciones. Si no está de acuerdo con alguno de los términos, le recomendamos no utilizar la plataforma. El uso continuado de nuestros servicios implica la aceptación tácita de estas condiciones.",
  },
  {
    id: "tc-2",
    question: "2. Registro y Cuenta",
    answer:
      "Para acceder a funcionalidades como compras, seguimiento de pedidos y gestiones de perfil, el usuario debe crear una cuenta con información veraz y actualizada. EliteShop se reserva el derecho de suspender cuentas que contengan datos fraudulentos o que violen los términos de uso.",
  },
  {
    id: "tc-3",
    question: "3. Productos y Precios",
    answer:
      "Todos los precios mostrados en la plataforma están en Pesos Colombianos (COP) e incluyen los impuestos aplicables, salvo indicación contraria. Los precios y la disponibilidad de los productos pueden cambiar sin previo aviso. Nos esforzamos por mantener la información actualizada, pero no garantizamos la ausencia de errores.",
  },
  {
    id: "tc-4",
    question: "4. Proceso de Compra",
    answer:
      "El proceso de compra implica la selección de productos, verificación del carrito, datos de envío y método de pago. El pedido se confirma únicamente cuando se recibe la confirmación de pago por parte de la pasarela de pagos. EliteShop reserva el derecho de rechazar pedidos en caso de detectar irregularidades.",
  },
  {
    id: "tc-5",
    question: "5. Pagos y Seguridad",
    answer:
      "Los pagos se procesan de forma segura a través de ePayco, cumpliendo con los estándares de seguridad PCI DSS. EliteShop no almacena datos de tarjetas de crédito o débito. Los métodos de pago aceptados incluyen tarjetas de crédito, débito y PSE.",
  },
  {
    id: "tc-6",
    question: "6. Envíos y Entregas",
    answer:
      "Los tiempos de envío varían según la ubicación del destinatario y la disponibilidad del producto. Los tiempos estimados se muestran durante el proceso de compra y pueden fluctuar entre 2 y 10 días hábiles. EliteShop no se hace responsable por retrasos ocasionados por terceros (transportadoras, fuerza mayor, etc.).",
  },
  {
    id: "tc-7",
    question: "7. Devoluciones y Reembolsos",
    answer:
      "El usuario cuenta con un plazo de 30 días calendario para solicitar la devolución de un producto, siempre que esté en perfectas condiciones y con su empaque original. Los reembolsos se procesarán en un plazo de 5 a 10 días hábiles después de la aprobación de la devolución.",
  },
  {
    id: "tc-8",
    question: "8. garantía de Productos",
    answer:
      "Todos los productos cuentan con la garantía que otorga el fabricante o distribuidor. En caso de defectos de fabricación, el usuario puede solicitar el cambio o reembolso dentro de los primeros 30 días después de la recepción del producto.",
  },
  {
    id: "tc-9",
    question: "9. Protección de Datos Personales",
    answer:
      "EliteShop se compromete a proteger la información personal de sus usuarios de conformidad con la Ley 1581 de 2012 (Protección de Datos Personales) y el Decreto 1377 de 2012. Los datos recopilados se utilizan exclusivamente para los fines comerciales de la plataforma y no serán compartidos con terceros sin autorización.",
  },
  {
    id: "tc-10",
    question: "10. Propiedad Intelectual",
    answer:
      "Todo el contenido de la plataforma, incluyendo textos, imágenes, logotipos, iconos y código fuente, es propiedad de EliteShop Colombia o de sus proveedores y está protegido por las leyes de propiedad intelectual. Queda prohibida su reproducción total o parcial sin autorización previa.",
  },
  {
    id: "tc-11",
    question: "11. Limitación de Responsabilidad",
    answer:
      "EliteShop no será responsable por daños indirectos, incidentales o consecuentes que puedan derivarse del uso de la plataforma. Nuestra responsabilidad máxima se limitará al valor total de la compra efectuada por el usuario.",
  },
  {
    id: "tc-12",
    question: "12. Modificaciones",
    answer:
      "EliteShop se reserva el derecho de modificar los presentes Términos y Condiciones en cualquier momento. Las modificaciones serán publicadas en la plataforma y entrarán en vigencia desde su publicación. El uso continuado de la plataforma después de las modificaciones implica la aceptación de los nuevos términos.",
  },
];

/* ------------------------------------------------------------------ */
/*  Data: PQRS                                                         */
/* ------------------------------------------------------------------ */
const PQRS_DATA = [
  {
    id: "pqrs-1",
    question: "1. Petición",
    answer:
      "Una petición es cualquier solicitud que usted como usuario realiza a EliteShop Colombia para obtener información, aclarar dudas o recibir un servicio al que tiene derecho. Ejemplos: consulta sobre el estado de un pedido, solicitud de información sobre un producto, solicitud de cotización, entre otros. Las peticiones deben ser atendidas en un plazo máximo de 15 días hábiles.",
  },
  {
    id: "pqrs-2",
    question: "2. Queja",
    answer:
      "Una queja expresa la inconformidad del usuario con respecto a un servicio recibido, la calidad de un producto o la atención recibida por parte del equipo de EliteShop. Ejemplos: demora en la entrega, producto no conforme con la descripción, atención inadecuada del servicio al cliente. Las quejas deben ser atendidas en un plazo máximo de 15 días hábiles.",
  },
  {
    id: "pqrs-3",
    question: "3. Reclamo",
    answer:
      "Un reclamo es la expresión de insatisfacción del usuario cuando ha sufrido un perjuicio económico o moral, y busca la reparación del daño o la solución a un problema concreto. Ejemplos: producto defectuoso que no fue reemplazado, cobro indebido, incumplimiento de un término contractual. Los reclamos deben ser atendidos en un plazo máximo de 15 días hábiles.",
  },
  {
    id: "pqrs-4",
    question: "4. Sugerencia",
    answer:
      "Una sugerencia es una recomendación o propuesta del usuario para mejorar los servicios, productos o la experiencia de compra en EliteShop Colombia. Todas las sugerencias son bienvenidas y serán evaluadas por nuestro equipo para implementar mejoras continuas.",
  },
  {
    id: "pqrs-5",
    question: "5. Como radicar una PQRS",
    answer:
      "Para radicar una PQRS, puede comunicarse a través de los siguientes canales: Correo electrónico: eliteshopcolombiastore@gmail.com, WhatsApp/Celular: 322 928 6047. Debe proporcionar su número de cédula, número de pedido (si aplica) y una descripción detallada de su petición, queja, reclamo o sugerencia.",
  },
  {
    id: "pqrs-6",
    question: "6. Tiempos de Respuesta",
    answer:
      "EliteShop Colombia se compromete a responder todas las PQRS en los siguientes plazos: Peticiones: máximo 15 días hábiles. Quejas: máximo 15 días hábiles. Reclamos: máximo 15 días hábiles. Sugerencias: máximo 30 días hábiles. Estos plazos cuentan a partir de la fecha de radicación de la PQRS.",
  },
  {
    id: "pqrs-7",
    question: "7. Derechos del Consumidor",
    answer:
      "Como consumidor en Colombia, usted cuenta con los derechos establecidos en el Código de Consumo (Ley 1480 de 2011), entre los cuales se destacan: derecho a la información veraz y oportuna, derecho a la protección contra la publicidad engañosa, derecho a la calidad de los productos y servicios, y derecho a la reparación de daños. EliteShop se compromete a respetar y hacer efectivos todos estos derechos.",
  },
];

/* ------------------------------------------------------------------ */
/*  Accordion Item                                                     */
/* ------------------------------------------------------------------ */
function AccordionItem({ id, question, answer, isOpen, onToggle }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle]
  );

  return (
    <div className={`faq__item${isOpen ? " faq__item--open" : ""}`}>
      <button
        type="button"
        className="faq__question"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={`${id}-answer`}
        id={`${id}-trigger`}
      >
        <span className="faq__question-text">{question}</span>
        <svg
          className="faq__chevron"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        className="faq__answer"
        id={`${id}-answer`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        hidden={!isOpen}
      >
        <div className="faq__answer-inner">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main FAQ Component                                                 */
/* ------------------------------------------------------------------ */
function FAQ({ onBack }) {
  const [activeTab, setActiveTab] = useState("terms");
  const [openItems, setOpenItems] = useState({});

  const toggleItem = useCallback((itemId) => {
    setOpenItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const currentData = activeTab === "terms" ? TERMS_DATA : PQRS_DATA;

  return (
    <div className="faq-page">
      {/* Back button */}
      <button type="button" className="faq__back" onClick={onBack}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver a la tienda
      </button>

      <div className="faq__container">
        {/* Header */}
        <div className="faq__header">
          <div className="faq__icon-wrapper">
            <svg
              className="faq__icon"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 className="faq__title">Preguntas Frecuentes</h1>
          <p className="faq__subtitle">
            Encuentra respuestas sobre nuestros términos, políticas y proceso
            de atención al cliente.
          </p>
        </div>

        {/* Tabs */}
        <div className="faq__tabs" role="tablist" aria-label="Secciones de ayuda">
          <button
            type="button"
            className={`faq__tab${activeTab === "terms" ? " faq__tab--active" : ""}`}
            role="tab"
            aria-selected={activeTab === "terms"}
            aria-controls="faq-panel-terms"
            id="faq-tab-terms"
            onClick={() => setActiveTab("terms")}
          >
            Términos y Condiciones
          </button>
          <button
            type="button"
            className={`faq__tab${activeTab === "pqrs" ? " faq__tab--active" : ""}`}
            role="tab"
            aria-selected={activeTab === "pqrs"}
            aria-controls="faq-panel-pqrs"
            id="faq-tab-pqrs"
            onClick={() => setActiveTab("pqrs")}
          >
            PQRS
          </button>
        </div>

        {/* Accordion Panel */}
        <div
          className="faq__panel"
          role="tabpanel"
          id={`faq-panel-${activeTab}`}
          aria-labelledby={`faq-tab-${activeTab}`}
        >
          {currentData.map((item) => (
            <AccordionItem
              key={item.id}
              id={item.id}
              question={item.question}
              answer={item.answer}
              isOpen={!!openItems[item.id]}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </div>

        {/* Contact footer */}
        <div className="faq__contact">
          <p className="faq__contact-text">
            No encontraste lo que buscabas?
          </p>
          <div className="faq__contact-channels">
            <div className="faq__channel">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>eliteshopcolombiastore@gmail.com</span>
            </div>
            <div className="faq__channel">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Cel/WhatsApp: 322 928 6047</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
