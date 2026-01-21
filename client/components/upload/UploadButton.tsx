interface UploadButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export default function UploadButton({ onClick, disabled = false }: UploadButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Upload Recording
        </button>
    );
}
