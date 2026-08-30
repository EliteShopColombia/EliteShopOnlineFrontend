# Plan de Integracion Frontend <-> Backend

> **Fecha:** 2026-08-30
> **Estado:** Pendiente de implementacion
> **Objetivo:** Cerrar los ultimos gaps entre el Frontend (React) y Backend (Spring Boot)
> para que la aplicacion funcione end-to-end sin errores.

---

## Auditoria Actual (2026-08-30)

### LO QUE YA ESTA HECHO

| # | Componente | Archivo | Estado |
|---|-----------|---------|--------|
| 1 | Servicio de ubicaciones con cache | `src/services/location.service.js` | Listo |
| 2 | Componente reutilizable DepartmentCitySelect | `src/components/shared/DepartmentCitySelect.jsx` | Listo |
| 3 | Datos de fallback colombia.js + CITIES_BY_DEPARTMENT | `src/constants/colombia.js` | Listo |
| 4 | Constantes de codigos de error | `src/constants/errorCodes.js` | Listo |
| 5 | parseApiError() reactivado | `src/helpers/api.helpers.js` | Listo |
| 6 | Token refresh automatico | `src/config/api.js` | Listo |
| 7 | Tracking endpoints corregidos | `src/services/order.service.js` | Listo |
| 8 | RegisterForm integrado con DepartmentCitySelect | `src/components/auth/RegisterForm.jsx` | Listo |
| 9 | Profile integrado con DepartmentCitySelect | `src/components/Profile/Profile.jsx` | Listo |
| 10 | SellerRegistration integrado con DepartmentCitySelect | `src/components/Seller/SellerRegistration.jsx` | Listo |
| 11 | Checkout integrado con DepartmentCitySelect | `src/components/Checkout/Checkout.jsx` | Listo |
| 12 | Error INVALID_LOCATION manejado en RegisterForm | `src/components/auth/RegisterForm.jsx` | Listo |
| 13 | Error INVALID_LOCATION manejado en Checkout | `src/components/Checkout/Checkout.jsx` | Listo |

### LO QUE FALTA - BACKEND (CRITICO)

| # | Tarea | Archivos | Prioridad |
|---|-------|----------|-----------|
| B1 | **Crear LocationController** con GET departments y GET cities | `shared/infrastructure/controller/LocationController.java` (nuevo) | ALTA |
| B2 | **Agregar `/api/v1/locations/**` a permitAll()** en SecurityConfig | `SecurityConfig.java` | ALTA |
| B3 | **Agregar rutas de locations en Gateway** | `config.yaml` + `config.docker.yaml` | ALTA |
| B4 | **Tests para LocationController** | `LocationControllerTest.java` (nuevo) | MEDIA |

### LO QUE FALTA - FRONTEND (MENOR)

| # | Tarea | Archivos | Prioridad |
|---|-------|----------|-----------|
| F1 | Migrar error handling en App.jsx | `src/App.jsx:88` | BAJA |
| F2 | Migrar error handling en BuyerOrderTracking.jsx | `src/components/Orders/BuyerOrderTracking.jsx:71` | BAJA |
| F3 | Migrar error handling en PaymentMethods.jsx (3 catches) | `src/components/PaymentMethods/PaymentMethods.jsx:70,82,92` | BAJA |
| F4 | Limpiar getActionError() duplicado en BuyerOrders.jsx | `src/components/Orders/BuyerOrders.jsx:17` | BAJA |

---

## FASE 1: Backend - LocationController (1-2h)

### B1: Crear LocationController

**Archivo nuevo:** `src/main/java/com/eliteshop/colombia/shared/infrastructure/controller/LocationController.java`

**Endpoints:**

```
GET /api/v1/locations/departments
  -> 200: [{ "id": 11, "name": "Bogota D.C." }, ...]

GET /api/v1/locations/departments/{id}/cities
  -> 200: [{ "id": 11001, "name": "Bogota" }, ...]
  -> 200 vacio si department no tiene ciudades
```

**Detalles de implementacion:**
- Usar `DepartmentRepository` y `CityRepository` (ya existen en `shared/infrastructure/persistence/`)
- Retornar entities directamente (son simples: id + name)
- Endpoints publicos (sin autenticacion) - los formularios de registro funcionan sin sesion
- Seguir el patron del `AdminController`: `@RestController`, `@RequestMapping`, `@RequiredArgsConstructor`

**Pseudocodigo:**

```java
@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

    private final DepartmentRepository departmentRepository;
    private final CityRepository cityRepository;

    @GetMapping("/departments")
    public List<DepartmentEntity> getDepartments() {
        return departmentRepository.findAll(Sort.by("name"));
    }

    @GetMapping("/departments/{id}/cities")
    public List<CityEntity> getCitiesByDepartment(@PathVariable Integer id) {
        return cityRepository.findByDepartmentId(id, Sort.by("name"));
    }
}
```

**Nota:** `CityRepository` necesita un nuevo metodo `findByDepartmentId(Integer departmentId, Sort sort)` - verificar si ya existe o agregarlo.

### B2: SecurityConfig - permitAll para locations

**Archivo:** `src/main/java/com/eliteshop/colombia/SecurityConfig.java`

**Cambio:** Agregar `/api/v1/locations/**` a la lista de `permitAll()`:

```java
.requestMatchers(
    "/api/v1/auth/register",
    "/api/v1/auth/login",
    "/health",
    "/webhooks/epayco/**",
    "/api/v1/webhooks/**",
    "/api/v1/locations/**"   // <-- AGREGAR
).permitAll()
```

### B3: Gateway - Rutas de locations

**Archivos:** `api-gateway-eliteshop/configs/config.yaml` y `config.docker.yaml`

**Agregar despues de las rutas de webhooks:**

```yaml
# === Locations (publico, sin auth) ===
- path: "/api/v1/locations/departments"
  method: "GET"
  backend: "eliteshop-backend"

- path: "/api/v1/locations/departments/{id}/cities"
  method: "GET"
  backend: "eliteshop-backend"
```

### B4: LocationControllerTest

**Archivo nuevo:** `src/test/java/com/eliteshop/colombia/shared/infrastructure/controller/LocationControllerTest.java`

**Tests:**
1. GET /api/v1/locations/departments -> 200, retorna lista de departamentos
2. GET /api/v1/locations/departments/11/cities -> 200, retorna ciudades de Bogota
3. GET /api/v1/locations/departments/999/cities -> 200, retorna lista vacia

** Patron:** Usar `@WebMvcTest(LocationController.class)` con `@MockitoBean` para los repos, igual que otros tests del proyecto.

---

## FASE 2: Frontend - Migrar error handling (30min)

### Patron de migracion

**En todos los archivos, cambiar:**

```javascript
// ANTES
const msg = err.response?.data?.message || err.response?.data?.error || err.message;
setError(msg);
```

**Por:**

```javascript
// DESPUES
import { parseApiError } from '../../helpers/api.helpers';

const { error } = parseApiError(err);
setError(error || 'Error inesperado');
```

### F1: App.jsx - Linea 88

```javascript
// ANTES:
setCartNotice(err.response?.data?.message || "No se pudo agregar al carrito");

// DESPUES:
const { error } = parseApiError(err);
setCartNotice(error || "No se pudo agregar al carrito");
```

### F2: BuyerOrderTracking.jsx - Linea 71

```javascript
// ANTES:
if (active) setError(err.response?.data?.message || 'No se pudo cargar el pedido.');

// DESPUES:
if (active) {
    const { error } = parseApiError(err);
    setError(error || 'No se pudo cargar el pedido.');
}
```

### F3: PaymentMethods.jsx - Lineas 70, 82, 92

```javascript
// ANTES (3 veces):
setError(err.response?.data?.message || 'No se pudo guardar/eliminar/establecer...');

// DESPUES (3 veces):
const { error } = parseApiError(err);
setError(error || 'No se pudo guardar la tarjeta');
```

### F4: BuyerOrders.jsx - Limpiar getActionError()

Eliminar la funcion `getActionError()` (linea 17-19) y reemplazar su uso (linea 80) por `parseApiError` que ya esta importado.

```javascript
// ANTES:
const getActionError = (error) => {
    return error?.response?.data?.errors?.[0] || error?.message || 'Error desconocido';
};
// ...
} catch (err) { setError(getActionError(err)); }

// DESPUES:
} catch (err) {
    const { error } = parseApiError(err);
    setError(error || 'Error desconocido');
}
```

---

## FASE 3: Verificacion End-to-End (1h)

### Checklist de pruebas

| # | Flujo | Que probar | Esperado |
|---|-------|-----------|----------|
| 1 | Registro | Abrir form de registro, verificar que departamentos cargan del backend | Selects poblados |
| 2 | Registro | Seleccionar departamento, verificar que ciudades cargan | Ciudades del dept |
| 3 | Registro | Registrar usuario nuevo con dept/city validos | 201 Created |
| 4 | Registro | Intentar registrar con dept invalido | 400 INVALID_LOCATION |
| 5 | Checkout | Hacer checkout con shipping dept/city | 200/201 |
| 6 | Perfil | Actualizar department/city del perfil | 200 OK |
| 7 | Seller | Registrar vendedor con tradeDepartment/tradeCity | 201 Created |
| 8 | Fallback | Simular backend caido, verificar que usa colombia.js | Lista local |
| 9 | Token | Esperar expiracion del token, verificar refresh automatico | Sin redirect a login |
| 10 | Errores | Verificar que errores de PaymentMethods muestran texto correcto | Mensaje del backend |

---

## Resumen de Estimacion

| Fase | Horas | Dependencias |
|------|-------|-------------|
| Fase 1: Backend LocationController | 1-2h | Ninguna |
| Fase 2: Frontend error handling | 30min | Ninguna |
| Fase 3: Verificacion E2E | 1h | Fase 1 completada |
| **Total** | **2.5-3.5h** | — |

---

## Notas Importantes

1. **El frontend ya esta listo para integrarse.** Solo falta el LocationController en el backend.
2. **El `PLAN_INTEGRACION_BACKEND.md` existente** documenta la Fase 1 del backend en detalle - usarlo como referencia.
3. **Los repos ya existen:** `DepartmentRepository` y `CityRepository` estan en `shared/infrastructure/persistence/`.
4. **No crear DTOs innecesarios:** Las entities son simples (id + name), retornarlas directo es suficiente.
5. **Seguir formato Google Java Format** - `./mvnw spotless:apply` antes de commitear.
