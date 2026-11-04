"use client";

import { Component, type ReactNode } from "react";

type Props = { onError: () => void; children: ReactNode };
type State = { hasError: boolean };

/**
 * Protege a home: qualquer falha do hero 3D (textura 404, chunk que não carrega,
 * renderer que não inicia) vira "sem 3D" e deixa o hero estático, em vez de derrubar a página.
 */
export class Hero3DBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
