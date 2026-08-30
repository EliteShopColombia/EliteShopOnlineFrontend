import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "../../services/admin.service.js";
import { sellerService } from "../../services/seller.service.js";
import { parseApiError } from "../../helpers/api.helpers.js";
import "./admin.css";

function AdminSellerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [contact, setContact] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSeller() {
      if (!cancelled) setLoading(true);
      if (!cancelled) setError(null);
      try {
        const sellerData = await adminService.getSellerById(id);
        if (!cancelled) setSeller(sellerData);

        const [contactData, bankData] = await Promise.allSettled([
          sellerService.getContact(id),
          sellerService.getBankInfo(id),
        ]);

        if (!cancelled && contactData.status === "fulfilled") setContact(contactData.value);
        if (!cancelled && bankData.status === "fulfilled") setBankInfo(bankData.value);
      } catch (err) {
        if (!cancelled) {
          const { error: msg } = parseApiError(err);
          setError(msg || "Error al cargar vendedor");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSeller();
    return () => { cancelled = true; };
  }, [id]);

  const handleToggleStatus = async () => {
    setToggling(true);
    try {
      await adminService.updateSellerStatus(id, !seller.isActive);
      setSeller((prev) => ({ ...prev, isActive: !prev.isActive }));
      setConfirmModal(false);
    } catch (err) {
      const { error: msg } = parseApiError(err);
      setError(msg || "Error al actualizar estado");
    } finally {
      setToggling(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" />
        Cargando vendedor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <p className="admin-error__text">{error}</p>
        <button type="button" className="admin-error__retry" onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  if (!seller) return null;

  return (
    <div>
      <div className="admin-page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/sellers")}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-link)",
              fontSize: 13,
              cursor: "pointer",
              marginBottom: 8,
              padding: 0,
            }}
          >
            &larr; Volver a vendedores
          </button>
          <h1 className="admin-page-header__title">{seller.tradeName}</h1>
          <p className="admin-page-header__subtitle">{seller.fullname}</p>
        </div>
        <button
          type="button"
          className={`admin-btn ${seller.isActive ? "admin-btn--danger" : "admin-btn--success"}`}
          onClick={() => setConfirmModal(true)}
          disabled={toggling}
        >
          {toggling ? "Procesando..." : seller.isActive ? "Desactivar" : "Activar"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Estado */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span className={`admin-badge ${seller.isActive ? "admin-badge--success" : "admin-badge--danger"}`}>
            {seller.isActive ? "Activo" : "Inactivo"}
          </span>
          <span className={`admin-badge ${seller.isVerified ? "admin-badge--success" : "admin-badge--warning"}`}>
            {seller.isVerified ? "Verificado" : "No verificado"}
          </span>
          <span className="admin-badge admin-badge--neutral">
            Tipo: {seller.typeTrade === "NATURAL" ? "Persona Natural" : "Persona Juridica"}
          </span>
        </div>

        {/* Info Personal */}
        <div className="admin-detail-card">
          <h3 className="admin-detail-card__title">Informacion Personal</h3>
          <div className="admin-detail-grid">
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Nombre completo</span>
              <span className="admin-detail-field__value">{seller.fullname}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Tipo de documento</span>
              <span className="admin-detail-field__value">{seller.typeDni || "-"}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Numero de documento</span>
              <span className="admin-detail-field__value">{seller.dniNumber || "-"}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Fecha de registro</span>
              <span className="admin-detail-field__value">{formatDate(seller.createdAt)}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Ultima actualizacion</span>
              <span className="admin-detail-field__value">{formatDate(seller.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Info del Comercio */}
        <div className="admin-detail-card">
          <h3 className="admin-detail-card__title">Datos del Comercio</h3>
          <div className="admin-detail-grid">
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Nombre comercial</span>
              <span className="admin-detail-field__value">{seller.tradeName}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Email</span>
              <span className="admin-detail-field__value">{contact?.email || "-"}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Telefono</span>
              <span className="admin-detail-field__value">{contact?.phoneNumber || "-"}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Direccion</span>
              <span className="admin-detail-field__value">{contact?.tradeAddress || "-"}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Departamento</span>
              <span className="admin-detail-field__value">{contact?.tradeDepartment || "-"}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Ciudad</span>
              <span className="admin-detail-field__value">{contact?.tradeCity || "-"}</span>
            </div>
          </div>
        </div>

        {/* Info Bancaria */}
        <div className="admin-detail-card">
          <h3 className="admin-detail-card__title">Informacion Bancaria</h3>
          <div className="admin-detail-grid">
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Banco</span>
              <span className="admin-detail-field__value">{bankInfo?.bankName || "-"}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Tipo de cuenta</span>
              <span className="admin-detail-field__value">{bankInfo?.typeBankAccount || "-"}</span>
            </div>
            <div className="admin-detail-field">
              <span className="admin-detail-field__label">Numero de cuenta</span>
              <span className="admin-detail-field__value">{bankInfo?.numberAccount || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmacion */}
      {confirmModal && (
        <div className="admin-modal-overlay" onClick={() => setConfirmModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal__title">
              {seller.isActive ? "Desactivar vendedor" : "Activar vendedor"}
            </h3>
            <p className="admin-modal__text">
              {seller.isActive
                ? `Deseas desactivar a "${seller.tradeName}"? No podra vender mientras este desactivado.`
                : `Deseas activar a "${seller.tradeName}"? Podra volver a vender.`}
            </p>
            <div className="admin-modal__actions">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setConfirmModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`admin-btn ${seller.isActive ? "admin-btn--danger" : "admin-btn--success"}`}
                onClick={handleToggleStatus}
                disabled={toggling}
              >
                {toggling ? "Procesando..." : seller.isActive ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSellerDetail;
