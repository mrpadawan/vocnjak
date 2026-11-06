import { Component, type ReactNode } from 'react';

/** Last line of defence: a friendly page instead of a blank screen if something unexpected throws. */
export default class RootErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Unexpected error:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div>
          <p style={{ fontSize: '3rem', margin: 0 }}>🍎</p>
          <h1 style={{ margin: '0.5rem 0' }}>Voćnjak</h1>
          <p style={{ opacity: 0.75 }}>Nešto je pošlo naopako. Osvežite stranicu. · Something went wrong — please reload.</p>
          <button
            type="button"
            onClick={() => location.reload()}
            style={{ marginTop: '1rem', padding: '0.7rem 1.4rem', borderRadius: 999, border: 0, background: '#f7be2e', fontWeight: 800, cursor: 'pointer' }}
          >
            ↻
          </button>
        </div>
      </main>
    );
  }
}
