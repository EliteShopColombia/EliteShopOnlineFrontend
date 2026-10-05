import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { parseApiError } from '../../helpers/api.helpers';
import { PRODUCT_CATEGORIES } from '../../constants/categories';
import './SellerDashboard.css';

const MAX_IMAGES = 7;

function SellerProductCreate({ sellerId, onBack }) {
    const { productId } = useParams();
    const isEditing = Boolean(productId);
    const effectiveSellerId = sellerId || localStorage.getItem('sellerId');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({ name: '', price: '', stock: '', category: '' });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        if (!productId) return;
        productService.getById(productId).then((product) => {
            setForm({
                name: product.name || '',
                price: product.price ?? '',
                stock: product.stock ?? '',
                category: product.category || '',
            });
        }).catch(() => setError('No se pudo cargar el producto.'));
    }, [productId]);

    // Libera las URLs de objeto al desmontar para no filtrar memoria.
    useEffect(() => () => {
        previews.forEach((url) => URL.revokeObjectURL(url));
    }, [previews]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImages = (e) => {
        const newFiles = Array.from(e.target.files || []);
        const combined = [...images, ...newFiles].slice(0, MAX_IMAGES);
        setImages(combined);
        // Revocar las anteriores antes de crear las nuevas evita acumular blobs.
        previews.forEach((url) => URL.revokeObjectURL(url));
        setPreviews(combined.map((f) => URL.createObjectURL(f)));
        e.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            if (!effectiveSellerId) {
                setError('No se pudo identificar el vendedor. Intenta iniciar sesion de nuevo.');
                setSubmitting(false);
                return;
            }
            const payload = {
                ...(isEditing ? {} : { sellerId: effectiveSellerId }),
                name: form.name.trim(),
                price: Number(form.price),
                stock: Number(form.stock),
                category: form.category || null,
            };
            if (isEditing) {
                await productService.update(productId, payload, images);
                setSuccess('Producto actualizado correctamente.');
            } else {
                await productService.create(payload, images);
                setSuccess('Producto creado correctamente.');
                setForm({ name: '', price: '', stock: '', category: '' });
            }
            setImages([]);
            setPreviews([]);
        } catch (err) {
            console.error('Product creation error:', err.response?.status, err.response?.data);
            const { error, code, fieldErrors } = parseApiError(err);
            let msg = 'No se pudo crear el producto';
            if (code === 'VALIDATION_FAILED' && fieldErrors) {
              msg = Object.values(fieldErrors).join(', ');
            } else if (error) {
              msg = error;
            }
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="seller-dash">
            <div className="seller-dash__container">
                <button type="button" className="seller-dash__back" onClick={onBack}>
                    ← Volver al panel
                </button>

                <h1 className="seller-dash__title">{isEditing ? 'Editar Producto' : 'Crear Producto'}</h1>

                {error && <p className="seller-dash__error">{error}</p>}
                {success && <p className="seller-dash__success">{success}</p>}

                <form className="seller-dash__form" onSubmit={handleSubmit}>
                    <div className="seller-dash__field">
                        <label htmlFor="pd-name">Nombre del producto *</label>
                        <input
                            id="pd-name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            required
                            minLength={2}
                            maxLength={255}
                        />
                    </div>

                    <div className="seller-dash__field">
                        <label htmlFor="pd-category">Categoría *</label>
                        <select
                            id="pd-category"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecciona una categoría</option>
                            {PRODUCT_CATEGORIES.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="seller-dash__row">
                        <div className="seller-dash__field">
                            <label htmlFor="pd-price">Precio (COP) *</label>
                            <input
                                id="pd-price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="seller-dash__field">
                            <label htmlFor="pd-stock">Stock *</label>
                            <input
                                id="pd-stock"
                                name="stock"
                                type="number"
                                min="0"
                                step="1"
                                value={form.stock}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="seller-dash__field">
                        <label htmlFor="pd-images">
                            Imagenes nuevas ({images.length}/{MAX_IMAGES})
                        </label>
                        <input
                            id="pd-images"
                            type="file"
                            accept="image/jpeg,image/png"
                            multiple
                            onChange={handleImages}
                            disabled={images.length >= MAX_IMAGES}
                        />
                    </div>

                    {previews.length > 0 && (
                        <div className="seller-dash__previews">
                            {previews.map((src, i) => (
                                <div key={i} className="seller-dash__preview-wrapper">
                                    <img src={src} alt={`Preview ${i + 1}`} />
                                    <button
                                        type="button"
                                        className="seller-dash__preview-remove"
                                        onClick={() => {
                                            setImages((prev) => prev.filter((_, idx) => idx !== i));
                                            setPreviews((prev) => prev.filter((_, idx) => idx !== i));
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button type="submit" className="seller-dash__submit" disabled={submitting}>
                        {submitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SellerProductCreate;
