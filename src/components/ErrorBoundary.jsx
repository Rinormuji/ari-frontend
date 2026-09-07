import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error("Unhandled application error", error, info);
    }
  }

  handleReload = () => window.location.reload();

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-[#0F4638] px-6 py-24 text-center text-white" role="alert">
          <h1 className="text-3xl font-extrabold">Diçka shkoi keq</h1>
          <p className="mx-auto mt-3 max-w-md text-white/65">
            Faqja nuk mund të shfaqet. Rifreskojeni për të provuar përsëri.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-7 rounded-xl bg-[#EFD391] px-6 py-3 text-sm font-bold text-black"
          >
            Rifresko faqen
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}