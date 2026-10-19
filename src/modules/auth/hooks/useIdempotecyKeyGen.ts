import { useRef } from "react";

export const useIdempotecyKeyGenonName = () => {
	const idempotencyKey = useRef<string | null>(null);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const resetIdempotencyKey = () => {
		if (timer.current) {
			clearTimeout(timer.current);
		}
		timer.current = null;
		idempotencyKey.current = null;
	};

	const generateIdempotencyKey = () => {
		if (!idempotencyKey.current) {
			idempotencyKey.current = crypto.randomUUID();
			timer.current = setTimeout(() => {
				idempotencyKey.current = null;
			}, 10 * 1000);
		}
	};

	return { generateIdempotencyKey, idempotencyKey, resetIdempotencyKey };
};
