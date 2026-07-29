import { CheckCircle, AlertCircle, X } from "lucide-react";

type SubmissionPopupProps = {
  open: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
};

export default function SubmissionPopup({ open, type, title, message, onClose }: SubmissionPopupProps) {
  if (!open) return null;

  const Icon = type === "success" ? CheckCircle : AlertCircle;
  const iconClass = type === "success" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
            <Icon size={26} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <h3 className="mt-5 text-xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[#f97316] px-4 py-3 text-sm font-semibold text-white hover:bg-[#ea580c]"
        >
          OK
        </button>
      </div>
    </div>
  );
}
