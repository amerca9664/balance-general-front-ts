import { translations, useTranslation } from "./LanguageProvider";

export const LanguageSelector = () => {
	const { language, setLanguage, t } = useTranslation();

	return (
		<select
			aria-label={t.language.label}
			className="fixed top-4 right-4 z-50 p-2 rounded-md text-blue-50 bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
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
