import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "./LanguageProvider";
import { themes, useTheme } from "./ThemeProvider";

const icons = { system: Monitor, light: Sun, dark: Moon };

export const ThemeSelector = () => {
	const { theme, setTheme } = useTheme();
	const { t } = useTranslation();
	// Cada click pasa al siguiente tema: sistema -> claro -> oscuro.
	const next = themes[(themes.indexOf(theme) + 1) % themes.length];
	const label = `${t.theme.label}: ${t.theme[theme]}`;
	const Icon = icons[theme];

	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			onClick={() => setTheme(next)}
			className="p-2 rounded-md text-gray-900 bg-white border border-gray-300 dark:text-blue-50 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
		>
			<Icon className="size-6" />
		</button>
	);
};
