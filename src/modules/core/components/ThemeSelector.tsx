import { useTranslation } from "./LanguageProvider";
import { themes, useTheme } from "./ThemeProvider";

export const ThemeSelector = () => {
	const { theme, setTheme } = useTheme();
	const { t } = useTranslation();

	return (
		<select
			aria-label={t.theme.label}
			className="fixed top-4 left-4 z-50 p-2 rounded-md text-blue-50 bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
			value={theme}
			onChange={(e) => setTheme(e.target.value as (typeof themes)[number])}
		>
			{themes.map((option) => (
				<option key={option} value={option}>
					{t.theme[option]}
				</option>
			))}
		</select>
	);
};
