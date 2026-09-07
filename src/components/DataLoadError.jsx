import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DataLoadError({ onRetry }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center" role="alert">
      <AlertTriangle className="mx-auto mb-3 text-amber-600" size={34} />
      <h2 className="text-lg font-bold text-[#0F4638]">Të dhënat nuk mund të ngarkohen</h2>
      <p className="mt-2 text-sm text-gray-600">
        Shërbimi është përkohësisht i padisponueshëm. Ju lutemi provoni përsëri.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0F4638] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0A3028]"
        >
          <RefreshCw size={16} />
          Provo përsëri
        </button>
      )}
    </div>
  );
}