import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/admin.service.js";
import { parseApiError, parsePageResponse } from "../../helpers/api.helpers.js";
import "./admin.css";

function AdminSellers() {
  const navigate = useNavigate();
  const [data, setData] = useState({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");


  useEffect(() => {
    let cancelled = false;

    async function loadSellers() {
      if (!cancelled) setLoading(true);
      if (!cancelled) setError(null);
      try {
        const raw = await adminService.getSellers(page, 10);
        if (!cancelled) setData(parsePageResponse(raw));
      } catch (err) {
        if (!cancelled) {
          const { error: msg } = parseApiError(err);
          setError(msg || "Error al cargar vendedores");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSellers();
    return () => { cancelled = true; };
  }, [page]);

  const filtered = data.content.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (s.tradeName || "").toLowerCase().includes(q) ||
      (s.fullname || "").toLowerCase().includes(q)
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

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">Vendedores</h1>
        <p className="admin-page-header__subtitle">Gestion de vendedores de la plataforma</p>
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
            {data.totalElements} vendedor{data.totalElements !== 1 ? "es" : ""}
          </span>
          <div className="admin-table-search">
            <svg className="admin-table-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="admin-table-search__input"
              type="text"
              placeholder="Buscar por nombre o comercio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-loading__spinner" />
            Cargando vendedores...
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty__text">No se encontraron vendedores</p>
          </div>
        ) : (
          <div className="admin-table--scrollable">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Comercio</th>
                  <th>Telefono</th>
                  <th>Verificado</th>
                  <th>Activo</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((seller) => (
                  <tr key={seller.id}>
                    <td data-label="Nombre" style={{ color: "var(--color-text)", fontWeight: 500 }}>
                      {seller.fullname}
                    </td>
                    <td data-label="Comercio">{seller.tradeName}</td>
                    <td data-label="Telefono">{seller.contact?.phoneNumber || "-"}</td>
                    <td data-label="Verificado">
                      <span className={`admin-badge ${seller.isVerified ? "admin-badge--success" : "admin-badge--warning"}`}>
                        {seller.isVerified ? "Verificado" : "Pendiente"}
                      </span>
                    </td>
                    <td data-label="Activo">
                      <span className={`admin-badge ${seller.isActive ? "admin-badge--success" : "admin-badge--danger"}`}>
                        {seller.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td data-label="Registro">{formatDate(seller.createdAt)}</td>
                    <td data-label="Acciones">
                      <button
                        type="button"
                        className="admin-btn admin-btn--secondary"
                        style={{ fontSize: 12, padding: "4px 10px" }}
                        onClick={() => navigate(`/admin/sellers/${seller.id}`)}
                      >
                        Ver detalle
                      </button>
                    </td>
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

export default AdminSellers;
