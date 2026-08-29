# EliteShop Colombia Frontend

Plataforma de comercio electrónico para Colombia, construida con React y Vite. Permite a los usuarios comprar productos, gestionar pedidos y a los vendedores administrar su tienda.

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | React 19 + Vite 8 |
| Lenguaje | JavaScript (JSX) |
| HTTP Client | Axios |
| Enrutamiento | react-router-dom v7 |
| Autenticación | JWT (localStorage) |
| Pagos | ePayco Smart Checkout |
| Estilos | CSS plain (BEM) |

## Características Principales

### Comprador
- Catálogo de productos con búsqueda y filtros
- Detalle de producto con imágenes
- Carrito de compras persistente
- Checkout con pago integrado (ePayco)
- Seguimiento de pedidos
- Historial de órdenes
- Perfil de usuario

### Vendedor
- Registro y verificación de vendedor
- Dashboard de vendedor
- Gestión de productos (CRUD)
- Gestión de pedidos recibidos
- Generación de etiquetas de envío

### Autenticación
- Login y registro de usuarios
- Token refresh automático
- Sesiones persistentes
- Roles: buyer, seller

## Requisitos Previos

- Node.js >= 18
- npm >= 9

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd EliteShopColombiaFrontend

# Instalar dependencias (usar npm ci para installs reproducibles)
npm ci
```

## Configuración del Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_VERSION=v1
```

**Nota:** El frontend espera el gateway en el puerto `8080`. El backend está documentado como servicio interno en `8081`.

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo (http://localhost:5173) |
| `npm run build` | Generar build de producción en `dist/` |
| `npm run preview` | Servir build generado en `dist/` |
| `npm run lint` | Ejecutar ESLint |

## Estructura del Proyecto

```
src/
├── assets/              # Imágenes y estáticos
├── components/          # Componentes React organizados por feature
│   ├── auth/           # LoginForm, RegisterForm
│   ├── CartModal/      # Modal del carrito
│   ├── Checkout/       # Flujo de checkout
│   ├── Gallery/        # Catálogo de productos
│   ├── Header/         # Navegación principal
│   ├── Hero/           # Sección hero
│   ├── Orders/         # Órdenes del comprador
│   ├── OrderTracking/  # Seguimiento de pedidos
│   ├── payment/        # Métodos de pago
│   ├── PaymentMethods/ # Gestión de métodos de pago
│   ├── ProductCard/    # Tarjeta de producto
│   ├── ProductDetail/  # Detalle de producto
│   ├── Profile/        # Perfil de usuario
│   └── Seller/         # Módulo de vendedor
├── config/             # Configuración (API client)
├── constants/          # Constantes de la aplicación
├── context/            # React Context (AuthContext)
├── helpers/            # Funciones auxiliares
├── hooks/              # Custom hooks
├── services/           # Servicios de API
├── utils/              # Utilidades (ePayco)
├── App.jsx             # Raíz de la aplicación y rutas
├── App.css             # Estilos del shell
├── index.css           # Estilos globales y reset
└── main.jsx            # Punto de entrada
```

## Arquitectura

### Flujo de Autenticación
1. El usuario se registra o inicia sesión
2. El backend retorna un JWT que se almacena en `localStorage`
3. Axios agrega el header `Authorization: Bearer <token>` automáticamente
4. En errores 401, se intenta refrescar el token
5. Si el refresh falla, se redirige a `/login`

### Servicios API
Todos los servicios usan el cliente Axios configurado en `src/config/api.js`:

- `auth.service.js` - Autenticación y registro
- `cart.service.js` - Carrito de compras
- `checkout.service.js` - Proceso de checkout
- `customer.service.js` - Datos del cliente
- `order.service.js` - Gestión de órdenes
- `payment.service.js` - Pagos
- `payment-method.service.js` - Métodos de pago
- `product.service.js` - Productos
- `review.service.js` - Reseñas
- `seller.service.js` - Gestión de vendedor
- `seller-verification.service.js` - Verificación de vendedor

### Rutas Principales

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Gallery | Catálogo de productos |
| `/product/:id` | ProductDetail | Detalle de producto |
| `/login` | LoginForm | Inicio de sesión |
| `/register` | RegisterForm | Registro |
| `/profile` | Profile | Perfil de usuario |
| `/profile/orders` | BuyerOrders | Órdenes del comprador |
| `/checkout` | Checkout | Flujo de pago |
| `/seller` | SellerRegistration | Registro de vendedor |
| `/seller/dashboard` | SellerDashboard | Dashboard del vendedor |
| `/seller/orders` | SellerOrders | Órdenes del vendedor |
| `/seller/products/new` | SellerProductCreate | Crear producto |

## Integración con Backend

El frontend se comunica con un gateway API. Ver `INTEGRATION.md` para detalles sobre contratos de error, endpoints de tracking, y el plan de integración completo.

## Licencia

MIT - Ver [LICENSE](LICENSE) para detalles.
