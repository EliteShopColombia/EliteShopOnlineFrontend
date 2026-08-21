import { useState } from 'react';
import { productService } from '../../services/product.service';
import './SellerDashboard.css';

const MAX_IMAGES = 7;

function SellerProductCreate({ sellerId, onBack }) {
    const effectiveSellerId = sellerId || localStorage.getItem('sellerId');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({ name: '', price: '', stock: '' });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImages = (e) => {
        const newFiles = Array.from(e.target.files || []);
        const combined = [...images, ...newFiles].slice(0, MAX_IMAGES);
        setImages(combined);
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
                sellerId: effectiveSellerId,
                name: form.name.trim(),
                price: Number(form.price),
                stock: Number(form.stock),
            };
            console.log('Creating product:', payload, 'images:', images.length);
            await productService.create(payload, images);
            setSuccess('Producto creado correctamente.');
            setForm({ name: '', price: '', stock: '' });
            setImages([]);
            setPreviews([]);
        } catch (err) {
            console.error('Product creation error:', err.response?.status, err.response?.data);
            const data = err.response?.data;
            let msg = 'No se pudo crear el producto';
            if (data) {
                if (typeof data === 'string') {
                    msg = data;
                } else if (data.message) {
                    msg = data.message;
                } else if (data.error) {
                    msg = data.error;
                } else if (data.errors && Array.isArray(data.errors)) {
                    msg = data.errors.map((e) => e.defaultMessage || e.message || e.field).join(', ');
                }
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

                <h1 className="seller-dash__title">Crear Producto</h1>

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
                            Imagenes ({images.length}/{MAX_IMAGES})
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
                        {submitting ? 'Creando...' : 'Crear producto'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SellerProductCreate;
