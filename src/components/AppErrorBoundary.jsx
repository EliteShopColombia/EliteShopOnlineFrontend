import { Component } from 'react';

class AppErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    render() {
        if (!this.state.error) return this.props.children;

        return (
            <main style={{ padding: '32px', color: '#1f2937', fontFamily: 'sans-serif' }}>
                <h1>No se pudo cargar EliteShop</h1>
                <p>{this.state.error.message || 'Error inesperado de la aplicación.'}</p>
                <button type="button" onClick={() => window.location.reload()}>
                    Recargar
                </button>
            </main>
        );
    }
}

export default AppErrorBoundary;