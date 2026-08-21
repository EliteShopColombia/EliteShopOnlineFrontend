import { useState, useEffect, useCallback } from 'react';
import { reviewService } from '../../services/review.service';
import { useAuth } from '../../context/AuthContext';
import './ReviewsSection.css';

const MAX_REVIEW_IMAGES = 3;

function ReviewsSection({ productId }) {
    const { user, isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [avgRating, setAvgRating] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ qualify: 5, content: '' });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const loadReviewData = useCallback(async () => {
        const result = await reviewService.getByProduct(productId).catch(() => null);
        const list = Array.isArray(result) ? result : result?.content || [];
        if (list.length > 0) {
            const sum = list.reduce((acc, r) => acc + (r.qualify || r.productQualify || 0), 0);
            return { list, avg: (sum / list.length).toFixed(1) };
        }
        return { list: [], avg: '0.0' };
    }, [productId]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const data = await loadReviewData();
            if (cancelled) return;
            setReviews(data.list);
            setAvgRating(data.avg);
            setLoading(false);
        }

        load();
        return () => { cancelled = true; };
    }, [loadReviewData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await reviewService.create(
                {
                    productId,
                    customerId: user.id,
                    qualify: Number(form.qualify),
                    content: form.content,
                },
                images
            );
            setShowForm(false);
            setForm({ qualify: 5, content: '' });
            setImages([]);
            setPreviews([]);
            setLoading(true);
            const data = await loadReviewData();
            setReviews(data.list);
            setAvgRating(data.avg);
            setLoading(false);
        } catch (err) {
            console.error('Review error:', err.response?.status, err.response?.data);
            const data = err.response?.data;
            let msg = 'No se pudo publicar la reseña';
            if (data) {
                if (typeof data === 'string') msg = data;
                else if (data.message) msg = data.message;
                else if (data.error) msg = data.error;
            }
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleImages = (e) => {
        const newFiles = Array.from(e.target.files || []);
        const combined = [...images, ...newFiles].slice(0, MAX_REVIEW_IMAGES);
        setImages(combined);
        setPreviews(combined.map((f) => URL.createObjectURL(f)));
        e.target.value = '';
    };

    if (loading) return null;

    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}
                className={`review-star ${star <= rating ? 'review-star--active' : ''}`}
            >
                ★
            </span>
        ));
    };

    const getInitials = (name) => {
        return name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';
    };

    const getRatingLabel = (rating) => {
        if (rating >= 4) return 'Excelente';
        if (rating >= 3) return 'Bueno';
        if (rating >= 2) return 'Regular';
        return 'Malo';
    };

    return (
        <div className="reviews-section">
            <div className="reviews-section__header">
                <div className="reviews-section__stats">
                    <span className="reviews-section__count">{reviews.length} reseñas</span>
                    <span className="reviews-section__divider">|</span>
                    <span className="reviews-section__avg">{avgRating}</span>
                    <div className="reviews-section__avg-stars">
                        {renderStars(Math.round(Number(avgRating)))}
                    </div>
                </div>
                <div className="reviews-section__verified">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#2778d4" stroke="none">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Todas las reseñas son de compras verificadas
                </div>
            </div>

            {isAuthenticated ? (
                <div className="reviews-section__write">
                    {!showForm ? (
                        <button
                            type="button"
                            className="reviews-section__write-btn"
                            onClick={() => setShowForm(true)}
                        >
                            Escribir reseña
                        </button>
                    ) : (
                        <form className="reviews-section__form" onSubmit={handleSubmit}>
                            <h3>Deja tu reseña</h3>

                            {error && <p className="reviews-section__error">{error}</p>}

                            <div className="reviews-section__form-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`reviews-section__star-btn ${star <= form.qualify ? 'reviews-section__star-btn--active' : ''}`}
                                        onClick={() => setForm({ ...form, qualify: star })}
                                        aria-label={`${star} estrellas`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>

                            <textarea
                                className="reviews-section__textarea"
                                name="content"
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                required
                                maxLength={1000}
                                placeholder="Cuéntanos tu experiencia con este producto..."
                            />

                            <label className="reviews-section__file-label">
                                Agregar imágenes (máximo {MAX_REVIEW_IMAGES})
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    multiple
                                    onChange={handleImages}
                                    disabled={images.length >= MAX_REVIEW_IMAGES}
                                />
                            </label>

                            {previews.length > 0 && (
                                <div className="reviews-section__previews">
                                    {previews.map((src, i) => (
                                        <div key={i} className="reviews-section__preview-wrapper">
                                            <img src={src} alt={`Reseña ${i + 1}`} />
                                            <button
                                                type="button"
                                                className="reviews-section__preview-remove"
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

                            <div className="reviews-section__form-actions">
                                <button
                                    type="submit"
                                    className="reviews-section__submit"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Publicando...' : 'Publicar reseña'}
                                </button>
                                <button
                                    type="button"
                                    className="reviews-section__cancel"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : null}

            <div className="reviews-section__list">
                {reviews.map((review) => {
                    const rating = review.qualify || review.productQualify || 0;
                    const name = review.customerName || 'Cliente';
                    const content = review.content || review.productReviewContent || '';
                    const reviewId = review.id || review.reviewId;
                    return (
                        <div key={reviewId} className="review-card">
                            <div className="review-card__header">
                                <div className="review-card__avatar">
                                    {getInitials(name)}
                                </div>
                                <span className="review-card__name">{name}</span>
                            </div>
                            <div className="review-card__rating">
                                <div className="review-card__stars">
                                    {renderStars(rating)}
                                </div>
                                <span className="review-card__label">{getRatingLabel(rating)}</span>
                            </div>
                            <p className="review-card__content">{content}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ReviewsSection;
