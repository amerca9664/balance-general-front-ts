import type { ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Para agregar un idioma basta pegar <codigo>.json en ../i18n/ (ej: fr.json).
// es.json es la referencia: las claves que falten en otro idioma caen al español.
const files = import.meta.glob<{ default: Translation }>("../i18n/*.json", {
	eager: true,
});
const es = files["../i18n/es.json"].default;

type Translation = typeof import("../i18n/es.json");

const withFallback = (lang: Partial<Translation>): Translation =>
	Object.fromEntries(
		Object.entries(es).map(([section, texts]) => [
			section,
			{ ...texts, ...lang[section as keyof Translation] },
		]),
	) as Translation;

export const translations: Record<string, Translation> = Object.fromEntries(
	Object.entries(files).map(([path, file]) => [
		path.slice(path.lastIndexOf("/") + 1, -".json".length),
		withFallback(file.default),
	]),
);

type LanguageContextValue = {
	language: string;
	setLanguage: (language: string) => void;
	t: Translation;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
	const { storedValue, setValue } = useLocalStorage("language", "es");
	// Un valor viejo/corrupto en localStorage no debe romper la UI.
	const language = Object.hasOwn(translations, storedValue)
		? storedValue
		: "es";

	useEffect(() => {
		document.documentElement.lang = language;
	}, [language]);

	return (
		<LanguageContext.Provider
			value={{ language, setLanguage: setValue, t: translations[language] }}
		>
			{children}
		</LanguageContext.Provider>
	);
};

export const useTranslation = (): LanguageContextValue => {
	const ctx = useContext(LanguageContext);
	if (!ctx)
		throw new Error("useTranslation debe usarse dentro de <LanguageProvider>");
	return ctx;
};
