import { useState, useEffect, useRef } from 'react';
import { locationService } from '../../services/location.service';
import { DEPARTMENTS, CITIES_BY_DEPARTMENT } from '../../constants/colombia';
import './DepartmentCitySelect.css';

/**
 * Selectores dependientes de Departamento y Ciudad.
 * Consulta el backend y cae a la lista local de colombia.js como fallback.
 *
 * Props:
 *   - departmentValue: string (nombre del departamento)
 *   - cityValue: string (nombre de la ciudad)
 *   - onDepartmentChange: (value: string) => void
 *   - onCityChange: (value: string) => void
 *   - departmentLabel?: string (default: "Departamento")
 *   - cityLabel?: string (default: "Ciudad")
 *   - departmentId?: string (prefijo para ids HTML, evita colisiones)
 *   - disabled?: boolean
 *   - required?: boolean
 *   - departmentError?: string
 *   - cityError?: string
 */
export default function DepartmentCitySelect({
  departmentValue = '',
  cityValue = '',
  onDepartmentChange,
  onCityChange,
  departmentLabel = 'Departamento',
  cityLabel = 'Ciudad',
  departmentId = 'dc',
  disabled = false,
  required = false,
  departmentError = '',
  cityError = '',
}) {
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const mountedRef = useRef(true);

  // Cargar departamentos al montar
  useEffect(() => {
    mountedRef.current = true;

    async function loadDepartments() {
      try {
        const data = await locationService.getDepartments();
        if (mountedRef.current) {
          setDepartments(data);
          setUsingFallback(false);
        }
      } catch {
        if (mountedRef.current) {
          setDepartments(DEPARTMENTS.map((d) => ({ id: d, name: d })));
          setUsingFallback(true);
        }
      } finally {
        if (mountedRef.current) setLoadingDepts(false);
      }
    }

    loadDepartments();
    return () => { mountedRef.current = false; };
  }, []);

  // Cargar ciudades cuando cambia el departamento
  useEffect(() => {
    const deptName = departmentValue;

    async function fetchCities() {
      setLoadingCities(true);

      if (!deptName) {
        if (mountedRef.current) setCities([]);
        if (mountedRef.current) setLoadingCities(false);
        return;
      }

      if (usingFallback) {
        const localCities = CITIES_BY_DEPARTMENT[deptName] || [];
        if (mountedRef.current) {
          setCities(localCities.map((c) => ({ id: c, name: c })));
          setLoadingCities(false);
        }
        return;
      }

      try {
        const dept = departments.find(
          (d) => d.name.toLowerCase() === deptName.toLowerCase()
        );
        if (!dept) {
          const localCities = CITIES_BY_DEPARTMENT[deptName] || [];
          if (mountedRef.current) {
            setCities(localCities.map((c) => ({ id: c, name: c })));
          }
          return;
        }

        const data = await locationService.getCitiesByDepartment(dept.id);
        if (mountedRef.current) {
          setCities(data);
        }
      } catch {
        if (mountedRef.current) {
          const localCities = CITIES_BY_DEPARTMENT[deptName] || [];
          setCities(localCities.map((c) => ({ id: c, name: c })));
        }
      } finally {
        if (mountedRef.current) setLoadingCities(false);
      }
    }

    fetchCities();
  }, [departmentValue, departments, usingFallback]);

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    onDepartmentChange?.(value);
    onCityChange?.('');
  };

  const handleCityChange = (e) => {
    onCityChange?.(e.target.value);
  };

  return (
    <div className="dc-select">
      {/* Departamento */}
      <div className="dc-select__field">
        <label htmlFor={`${departmentId}-dept`} className="dc-select__label">
          {departmentLabel}{required && ' *'}
        </label>
        <select
          id={`${departmentId}-dept`}
          className={`dc-select__select ${departmentError ? 'dc-select__select--error' : ''}`}
          value={departmentValue}
          onChange={handleDepartmentChange}
          disabled={disabled || loadingDepts}
          required={required}
          aria-describedby={departmentError ? `${departmentId}-dept-error` : undefined}
          aria-invalid={!!departmentError}
        >
          <option value="">
            {loadingDepts ? 'Cargando...' : 'Seleccionar'}
          </option>
          {departments.map((d) => (
            <option key={d.id ?? d} value={d.name ?? d}>
              {d.name ?? d}
            </option>
          ))}
        </select>
        {departmentError && (
          <span id={`${departmentId}-dept-error`} className="dc-select__error" role="alert">
            {departmentError}
          </span>
        )}
      </div>

      {/* Ciudad */}
      <div className="dc-select__field">
        <label htmlFor={`${departmentId}-city`} className="dc-select__label">
          {cityLabel}{required && ' *'}
        </label>
        <select
          id={`${departmentId}-city`}
          className={`dc-select__select ${cityError ? 'dc-select__select--error' : ''}`}
          value={cityValue}
          onChange={handleCityChange}
          disabled={disabled || !departmentValue || loadingCities}
          required={required}
          aria-describedby={cityError ? `${departmentId}-city-error` : undefined}
          aria-invalid={!!cityError}
        >
          <option value="">
            {loadingCities
              ? 'Cargando...'
              : !departmentValue
                ? 'Selecciona un departamento'
                : 'Seleccionar'}
          </option>
          {cities.map((c) => (
            <option key={c.id ?? c} value={c.name ?? c}>
              {c.name ?? c}
            </option>
          ))}
        </select>
        {cityError && (
          <span id={`${departmentId}-city-error`} className="dc-select__error" role="alert">
            {cityError}
          </span>
        )}
      </div>
    </div>
  );
}
