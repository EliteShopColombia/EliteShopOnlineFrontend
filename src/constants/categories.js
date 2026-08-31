/**
 * Categorías del catálogo de productos.
 * El `value` es lo que se almacena en el backend y se envía como tag del producto.
 * El `label` es lo que se muestra al usuario en la UI.
 */
export const PRODUCT_CATEGORIES = [
    { value: 'MEDICINA', label: 'Medicina' },
    { value: 'DEPORTES', label: 'Deportes' },
    { value: 'BELLEZA', label: 'Belleza' },
    { value: 'ROPA', label: 'Ropa' },
    { value: 'TECNOLOGIA', label: 'Tecnología' },
    { value: 'MANUALIDADES', label: 'Manualidades' },
    { value: 'JUGUETES', label: 'Juguetes' },
    { value: 'AUTOMOTRIZ', label: 'Automotriz' },
];

/**
 * Mapa rápido value → label para buscar el nombre de display de una categoría.
 */
export const CATEGORY_LABELS = Object.fromEntries(
    PRODUCT_CATEGORIES.map(({ value, label }) => [value, label])
);
