import { translations, useTranslation } from "./LanguageProvider";

export const LanguageSelector = () => {
	const { language, setLanguage, t } = useTranslation();

	return (
		<select
			aria-label={t.language.label}
			className="p-2 rounded-md text-gray-900 bg-white border border-gray-300 dark:text-blue-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-blue-500"
			value={language}
			onChange={(e) => setLanguage(e.target.value)}
		>
			{Object.entries(translations).map(([code, texts]) => (
				<option key={code} value={code}>
					{texts.language.name}
				</option>
			))}
		</select>
	);
};
