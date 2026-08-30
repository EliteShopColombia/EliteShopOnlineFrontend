import { useState, useEffect } from "react";
import { adminService } from "../../services/admin.service.js";
import { parseApiError } from "../../helpers/api.helpers.js";
import "./admin.css";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const data = await adminService.getDashboard();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          const { error: msg } = parseApiError(err);
          setError(msg || "Error al cargar el dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" />
        Cargando dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <p className="admin-error__text">{error}</p>
        <button type="button" className="admin-error__retry" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const statCards = [
    {
      label: "Total Clientes",
      value: stats?.totalCustomers ?? 0,
      iconClass: "blue",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Total Vendedores",
      value: stats?.totalSellers ?? 0,
      iconClass: "purple",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      label: "Vendedores Activos",
      value: stats?.activeSellers ?? 0,
      iconClass: "green",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Total Ordenes",
      value: stats?.totalOrders ?? 0,
      iconClass: "yellow",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      label: "Ingresos Totales",
      value: formatCurrency(stats?.totalRevenue),
      iconClass: "pink",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "Total Productos",
      value: stats?.totalProducts ?? 0,
      iconClass: "cyan",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">Dashboard</h1>
        <p className="admin-page-header__subtitle">Resumen general de la plataforma</p>
      </div>

      <div className="admin-stats">
        {statCards.map((card) => (
          <div key={card.label} className="admin-stat-card">
            <div className={`admin-stat-card__icon admin-stat-card__icon--${card.iconClass}`}>
              {card.icon}
            </div>
            <span className="admin-stat-card__label">{card.label}</span>
            <span className="admin-stat-card__value">{card.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
