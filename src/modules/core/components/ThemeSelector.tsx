import { useTranslation } from "./LanguageProvider";
import { themes, useTheme } from "./ThemeProvider";

const icons = {
	system: <path d="M3 5h18v11H3zM8 20h8M12 16v4" />,
	light: (
		<>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
		</>
	),
	dark: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />,
};

export const ThemeSelector = () => {
	const { theme, setTheme } = useTheme();
	const { t } = useTranslation();
	// Cada click pasa al siguiente tema: sistema -> claro -> oscuro.
	const next = themes[(themes.indexOf(theme) + 1) % themes.length];
	const label = `${t.theme.label}: ${t.theme[theme]}`;

	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			onClick={() => setTheme(next)}
			className="p-2 rounded-md text-gray-900 bg-white border border-gray-300 dark:text-blue-50 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
		>
			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				className="size-6"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{icons[theme]}
			</svg>
		</button>
	);
};
