import { useState, useEffect } from "react";
import { adminService } from "../../services/admin.service.js";
import { parseApiError, parsePageResponse } from "../../helpers/api.helpers.js";
import "./admin.css";

const STATUS_BADGE_MAP = {
  PENDING_PAYMENT: "warning",
  PAID: "info",
  IN_PREPARATION: "info",
  SHIPPED: "info",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "danger",
  DISPUTE: "danger",
  REFUNDED: "warning",
};

const STATUS_LABELS = {
  PENDING_PAYMENT: "Pendiente",
  PAID: "Pagado",
  IN_PREPARATION: "Preparando",
  SHIPPED: "Enviado",
  OUT_FOR_DELIVERY: "En reparto",
  DELIVERED: "Entregado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
  DISPUTE: "Disputa",
  REFUNDED: "Reembolsado",
};

function AdminOrders() {
  const [data, setData] = useState({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      if (!cancelled) setLoading(true);
      if (!cancelled) setError(null);
      try {
        const raw = await adminService.getOrders(page, 10);
        if (!cancelled) setData(parsePageResponse(raw));
      } catch (err) {
        if (!cancelled) {
          const { error: msg } = parseApiError(err);
          setError(msg || "Error al cargar ordenes");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    return () => { cancelled = true; };
  }, [page]);

  const filtered = data.content.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (o.id || "").toLowerCase().includes(q) ||
      (o.customerId || "").toLowerCase().includes(q) ||
      (o.shippingAddress || "").toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const shortId = (id) => (id ? id.substring(0, 8) + "..." : "-");

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">Ordenes</h1>
        <p className="admin-page-header__subtitle">Listado de todas las ordenes de la plataforma</p>
      </div>

      {error && (
        <div className="admin-error" style={{ marginBottom: 16 }}>
          <p className="admin-error__text">{error}</p>
          <button type="button" className="admin-error__retry" onClick={() => setPage((p) => p)}>Reintentar</button>
        </div>
      )}

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <span className="admin-table-header__title">
            {data.totalElements} orden{data.totalElements !== 1 ? "es" : ""}
          </span>
          <div className="admin-table-search">
            <svg className="admin-table-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="admin-table-search__input"
              type="text"
              placeholder="Buscar por ID o direccion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-loading__spinner" />
            Cargando ordenes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty__text">No se encontraron ordenes</p>
          </div>
        ) : (
          <div className="admin-table--scrollable">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Direccion</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td data-label="ID" style={{ fontFamily: "monospace", fontSize: 13 }}>
                      {shortId(order.id)}
                    </td>
                    <td data-label="Cliente" style={{ fontFamily: "monospace", fontSize: 13 }}>
                      {shortId(order.customerId)}
                    </td>
                    <td data-label="Total" style={{ color: "var(--color-text)", fontWeight: 600 }}>
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td data-label="Estado">
                      <span className={`admin-badge admin-badge--${STATUS_BADGE_MAP[order.status] || "neutral"}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td data-label="Direccion" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {order.shippingAddress || "-"}
                    </td>
                    <td data-label="Fecha">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data.totalPages > 1 && (
          <div className="admin-pagination">
            <span className="admin-pagination__info">
              Pagina {data.page + 1} de {data.totalPages}
            </span>
            <div className="admin-pagination__controls">
              <button
                type="button"
                className="admin-pagination__btn"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Anterior
              </button>
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, data.totalPages - 5));
                const pageNum = start + i;
                if (pageNum >= data.totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`admin-pagination__btn ${pageNum === page ? "admin-pagination__btn--active" : ""}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                type="button"
                className="admin-pagination__btn"
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
