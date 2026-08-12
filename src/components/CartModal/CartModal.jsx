import "./CartModal.css";

const cartProducts = [
  {
    id: 1,
    name: "Juguete para niños",
    price: "$95.000",
    quantity: 1,
    image: "/src/assets/images/Niños.jpg",
  },
  {
    id: 2,
    name: "PlayStation 5",
    price: "$150.000",
    quantity: 1,
    image: "/src/assets/images/Play5.jpg",
  },
  {
    id: 3,
    name: "Balón deportivo",
    price: "$180.000",
    quantity: 1,
    image: "/src/assets/images/Balon.jpg",
  },
  {
    id: 4,
    name: "Camiseta Casual",
    price: "$120.000",
    quantity: 1,
    image: "/src/assets/images/Prenda.jpg",
  },
  {
    id: 5,
    name: "Productos Kairté",
    price: "$180.000",
    quantity: 1,
    image: "/src/assets/images/Karité.jpg",
  },
];

function CartModal({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="cart-modal__overlay" onClick={onClose}>
      <div
        className="cart-modal"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ENCABEZADO */}
        <div className="cart-modal__header">
          <h2>MI CARRITO</h2>

          <button
            className="cart-modal__close"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            ×
          </button>
        </div>

        {/* PRODUCTOS */}
        <div className="cart-modal__products">
          {cartProducts.map((product) => (
            <div className="cart-item" key={product.id}>
              
              <div className="cart-item__image">
                <img
                  src={product.image}
                  alt={product.name}
                />
              </div>

              <div className="cart-item__info">
                <h3>{product.name}</h3>

                <span>{product.price}</span>

                <small>
                  CANTIDAD: {product.quantity}
                </small>
              </div>

              <button
                className="cart-item__delete"
                aria-label={`Eliminar ${product.name}`}
              >
                🗑
              </button>

            </div>
          ))}
        </div>

        {/* PIE DEL CARRITO */}
        <div className="cart-modal__footer">

          <div className="cart-modal__total">
            <span>Total a pagar</span>
            <strong>$565.000</strong>
          </div>

          <div className="cart-modal__actions">
            <button className="cart-modal__checkout">
              REALIZAR COMPRA
            </button>

            <button className="cart-modal__view">
              VER CARRITO COMPLETO
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CartModal;