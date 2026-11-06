import { Component, type ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

/** Catches WebGL / context-creation failures so the rest of the page (and the place list) keeps working. */
export default class MapErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('3D map failed to render:', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
