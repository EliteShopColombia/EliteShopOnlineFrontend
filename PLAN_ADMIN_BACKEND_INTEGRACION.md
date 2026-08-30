# Plan de Integración: Panel de Administrador + Gaps Backend→Frontend

**Fecha:** 2026-08-30
**Estado:** ✅ Completado

---

## PARTE 1: PANEL DE ADMINISTRADOR (No existe nada en Frontend)

El Backend ya expone 6 endpoints admin que el Frontend no consume:

### Endpoints Admin del Backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/admin/dashboard` | Estadísticas: totalCustomers, totalSellers, activeSellers, totalOrders, totalRevenue, totalProducts |
| `GET` | `/api/v1/admin/customers` | Listado paginado de todos los clientes |
| `GET` | `/api/v1/admin/sellers` | Listado paginado de todos los vendedores |
| `GET` | `/api/v1/admin/sellers/{id}` | Detalle de un vendedor (entidad JPA completa) |
| `PATCH` | `/api/v1/admin/sellers/{id}/status` | Activar/desactivar vendedor (`{isActive: boolean}`) |
| `GET` | `/api/v1/admin/orders` | Listado paginado de todas las órdenes |

### DTOs del Backend

**AdminDashboardResponse:**
```json
{
  "totalCustomers": 150,
  "totalSellers": 45,
  "activeSellers": 38,
  "totalOrders": 1200,
  "totalRevenue": 45000000.00,
  "totalProducts": 320
}
```

**SellerStatusRequest:**
```json
{
  "isActive": true
}
```

**PageResponse\<T>:**
```json
{
  "content": [],
  "page": 0,
  "size": 10,
  "totalElements": 150,
  "totalPages": 15
}
```

### Roles y Seguridad

- Los endpoints admin requieren `ROLE_ADMIN` en el JWT
- El JWT se resuelve por email: si `customer.role == "admin"` → `"admin"`
- El gateway inyecta headers `X-User-Role`, `X-User-ID`, `X-User-Email`
- El backend valida autorización con `AuthorizationService`

---

## PARTE 2: GAPS ENTRE BACKEND Y FRONTEND

### Gap 1: `GET /orders` (listado general)
- **Backend:** `GET /api/v1/orders` → retorna órdenes del usuario autenticado (paginado, `PageResponse<OrderResponse>`)
- **Frontend:** No tiene método para este endpoint. Solo usa `getMyOrders(customerId)` y `getMySales(sellerId)`
- **Acción:** Agregar `orderService.getAllOrders(page, size)` en el servicio de órdenes

### Gap 2: `GET /seller-info/{sellerId}` (info bancaria)
- **Backend:** `GET /api/v1/seller-info/{sellerId}` → retorna `{ sellerId, tradeName, fullname, bankName, typeBankAccount, numberAccount }` (requiere auth SELLER, ownership)
- **Frontend:** No consume este endpoint
- **Acción:** Agregar método en `seller.service.js`

### Gap 3: `GET /customers/{id}/avatar` (descarga de avatar)
- **Backend:** `GET /api/v1/customers/{id}/avatar` → retorna imagen binaria
- **Frontend:** Usa `fetchAvatarBlob` con URL construida manualmente
- **Acción:** Revisar `helpers/avatar.js` para que apunte al endpoint correcto

### Gap 4: Paginación en `GET /customers`
- **Backend:** `GET /api/v1/customers` → paginado (requiere ADMIN), retorna `PageResponse<CustomerResponse>`
- **Frontend:** `customerService.getAll()` no maneja paginación
- **Acción:** Actualizar `customerService` para soportar `page` y `size`

### Gap 5: Paginación en `GET /sellers`
- **Backend:** `GET /api/v1/sellers` → paginado (público), retorna `PageResponse<SellerResponse>`
- **Frontend:** `sellerService.getAll()` no maneja paginación
- **Acción:** Actualizar `sellerService` para soportar `page` y `size`

### Gap 6: Endpoint de tracking dual
- **Backend:** `GET /api/v1/orders/{id}/tracking` y `PATCH /api/v1/orders/{id}/tracking`
- **Frontend:** Usa `PATCH` correctamente para actualizar, y `GET` para eventos
- **Estado:** ✅ Corregido (ver INTEGRATION.md)

---

## FASES DE IMPLEMENTACIÓN

### Fase 1: Infraestructura Admin

1. **Crear `src/services/admin.service.js`** con 6 métodos:
   - `getDashboard()` → `GET /admin/dashboard`
   - `getCustomers(page, size)` → `GET /admin/customers?page={page}&size={size}`
   - `getSellers(page, size)` → `GET /admin/sellers?page={page}&size={size}`
   - `getSellerById(id)` → `GET /admin/sellers/{id}`
   - `updateSellerStatus(id, isActive)` → `PATCH /admin/sellers/{id}/status`
   - `getOrders(page, size)` → `GET /admin/orders?page={page}&size={size}`

2. **Modificar `src/context/AuthContext.jsx`** — Agregar detección de `role === 'admin'`:
   - Decodificar JWT y extraer `role`
   - Exponer `isAdmin` en el contexto
   - Mantener compatibilidad con `isCustomer` y `isSeller`

3. **Crear `src/components/Admin/AdminLayout.jsx`** — Layout con sidebar:
   - Sidebar con navegación: Dashboard, Clientes, Vendedores, Órdenes
   - Header con nombre del admin y botón logout
   - Contenido principal con `<Outlet />` para rutas hijas
   - Responsive: sidebar colapsable en móvil

4. **Crear `src/components/Admin/AdminLayout.css`** — Estilos del layout admin

5. **Modificar `src/App.jsx`** — Agregar rutas admin:
   ```jsx
   <Route path="/admin" element={<AdminLayout />}>
     <Route index element={<AdminDashboard />} />
     <Route path="customers" element={<AdminCustomers />} />
     <Route path="sellers" element={<AdminSellers />} />
     <Route path="sellers/:id" element={<AdminSellerDetail />} />
     <Route path="orders" element={<AdminOrders />} />
   </Route>
   ```

6. **Modificar `src/components/Header/Header.jsx`** — Agregar opción "Panel Admin":
   - Visible solo si `role === 'admin'`
   - Link a `/admin`
   - Icono de administrador

### Fase 2: Dashboard Admin

7. **Crear `src/components/Admin/AdminDashboard.jsx`**:
   - 6 tarjetas de estadísticas con iconos
   - Tarjetas: Total Clientes, Total Vendedores, Vendedores Activos, Total Órdenes, Ingresos Totales, Total Productos
   - Formato de moneda colombiana para ingresos
   - Estilo grid responsive

8. **Crear `src/components/Admin/admin.css`** — Estilos compartidos:
   - Tablas paginadas
   - Filtros de búsqueda
   - Badges de estado
   - Botones de acción
   - Tarjetas de estadísticas
   - Modal de confirmación

### Fase 3: Gestión de Entidades

9. **Crear `src/components/Admin/AdminCustomers.jsx`**:
   - Tabla con columnas: Nombre, Email, Teléfono, DNI, Ciudad, Fecha Registro
   - Paginación con navegación (anterior/siguiente/páginas)
   - Búsqueda por nombre o email
   - Loading states

10. **Crear `src/components/Admin/AdminSellers.jsx`**:
    - Tabla con columnas: Nombre, Comercio, Email, Teléfono, Verificado, Activo, Fecha Registro
    - Toggle switch para activar/desactivar vendedor (con confirmación)
    - Badge de verificación (verificado/pendiente/rechazado)
    - Link a detalle del vendedor
    - Paginación y búsqueda

11. **Crear `src/components/Admin/AdminSellerDetail.jsx`**:
    - Información personal del vendedor
    - Datos del comercio (nombre, dirección, departamento, ciudad)
    - Información bancaria (banco, tipo cuenta, número cuenta)
    - Estado de verificación (status, score de confianza, razón de rechazo)
    - Toggle activo/inactivo con confirmación
    - Botón para volver a la lista

12. **Crear `src/components/Admin/AdminOrders.jsx`**:
    - Tabla con columnas: ID (corto), Cliente, Total, Estado, Fecha, Dirección
    - Filtro por estado de orden (todos, pendiente, pagado, enviado, etc.)
    - Badge de color por estado
    - Paginación y búsqueda
    - Click en fila para ver detalle (opcional: modal o ruta)

### Fase 4: Gaps Backend→Frontend

13. **Modificar `src/services/customer.service.js`**:
    - Agregar parámetros `page` y `size` a `getAll()`
    - Retornar `PageResponse` en lugar de array

14. **Modificar `src/services/seller.service.js`**:
    - Agregar parámetros `page` y `size` a `getAll()`
    - Agregar método `getSellerInfo(sellerId)` → `GET /seller-info/{sellerId}`

15. **Modificar `src/services/order.service.js`**:
    - Agregar método `getAllOrders(page, size)` → `GET /orders?page={page}&size={size}`

16. **Revisar `src/helpers/avatar.js`**:
    - Verificar que `fetchAvatarBlob` use la URL correcta del backend
    - Backend: `GET /api/v1/customers/{id}/avatar` y `GET /api/v1/sellers/{id}/avatar`

### Fase 5: Verificación

17. Ejecutar `npm run lint` y corregir errores
18. Ejecutar `npm run build` y verificar compilación exitosa

---

## ARCHIVOS A CREAR (8 nuevos)

| Archivo | Descripción |
|---------|-------------|
| `src/services/admin.service.js` | Servicio con 6 métodos para endpoints admin |
| `src/components/Admin/AdminLayout.jsx` | Layout con sidebar de navegación |
| `src/components/Admin/AdminLayout.css` | Estilos del layout admin |
| `src/components/Admin/AdminDashboard.jsx` | Dashboard con tarjetas de estadísticas |
| `src/components/Admin/AdminCustomers.jsx` | Tabla paginada de clientes |
| `src/components/Admin/AdminSellers.jsx` | Tabla paginada de vendedores |
| `src/components/Admin/AdminSellerDetail.jsx` | Detalle de un vendedor |
| `src/components/Admin/AdminOrders.jsx` | Tabla paginada de órdenes |
| `src/components/Admin/admin.css` | Estilos compartidos del admin |

## ARCHIVOS A MODIFICAR (5 existentes)

| Archivo | Cambio |
|---------|--------|
| `src/context/AuthContext.jsx` | Agregar detección de `role === 'admin'`, exponer `isAdmin` |
| `src/App.jsx` | Agregar 5 rutas admin bajo `/admin` |
| `src/components/Header/Header.jsx` | Agregar opción "Panel Admin" visible para admins |
| `src/services/customer.service.js` | Agregar paginación a `getAll()` |
| `src/services/seller.service.js` | Agregar paginación + método `getSellerInfo()` |
| `src/services/order.service.js` | Agregar método `getAllOrders(page, size)` |
| `src/helpers/avatar.js` | Revisar URLs de avatar contra endpoints backend |

---

## ESTIMACIÓN

| Fase | Tiempo estimado |
|------|-----------------|
| Fase 1: Infraestructura Admin | 1.5 - 2h |
| Fase 2: Dashboard Admin | 1 - 1.5h |
| Fase 3: Gestión de Entidades | 2.5 - 3h |
| Fase 4: Gaps Backend→Frontend | 1 - 1.5h |
| Fase 5: Verificación | 30 min |
| **Total** | **6.5 - 8.5h** |

---

## NOTAS TÉCNICAS

- **Estilos:** CSS plain con convención BEM, co-located CSS. No introducir Tailwind, CSS Modules o CSS-in-JS.
- **Responsive:** Mantener breakpoints existentes: 1100px, 850px, 600px.
- **Estado de orden (OrderStatus):** PENDING_PAYMENT, PAID, IN_PREPARATION, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, COMPLETED, CANCELLED, DISPUTE, REFUNDED.
- **Manejo de errores:** Usar `parseApiError()` de `helpers/api.helpers.js`.
- **Paginación:** Usar `parsePageResponse()` de `helpers/api.helpers.js`.
- **Rutas:** Mantener `App.jsx` sincronizado con las nuevas rutas admin.
