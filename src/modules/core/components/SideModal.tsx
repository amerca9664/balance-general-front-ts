import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { useTranslation } from "./LanguageProvider";

// <dialog> nativo con showModal(): trae foco atrapado, Escape y top layer
// (queda encima de todo sin pelear z-index con la sidebar o los selectores).
export const SideModal = ({
	open,
	onClose,
	title,
	children,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}) => {
	const { t } = useTranslation();
	const ref = useRef<HTMLDialogElement>(null);
	const titleId = useId();

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: el teclado ya cierra con Escape (nativo del dialog)
		<dialog
			ref={ref}
			aria-labelledby={titleId}
			onClose={onClose}
			// El dialog cubre solo el panel; un click que cae en el dialog mismo es el backdrop.
			onClick={(e) => e.target === e.currentTarget && onClose()}
			className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-md p-0 bg-transparent backdrop:bg-black/50"
		>
			<div className="flex h-full flex-col gap-4 overflow-y-auto bg-white p-6 text-gray-900 dark:bg-gray-900 dark:text-white">
				<div className="flex items-center justify-between gap-4">
					<h2 id={titleId} className="text-lg font-semibold">
						{title}
					</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label={t.modules.close}
						className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
					>
						<X className="size-5" />
					</button>
				</div>
				{children}
			</div>
		</dialog>
	);
};
