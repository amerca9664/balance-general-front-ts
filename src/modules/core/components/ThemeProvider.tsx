import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const themes = ["system", "light", "dark"] as const;
type Theme = (typeof themes)[number];

type ThemeContextValue = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const media = window.matchMedia("(prefers-color-scheme: dark)");

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const { storedValue, setValue } = useLocalStorage<Theme>("theme", "system");
	// Un valor viejo/corrupto en localStorage no debe romper la UI.
	const theme = themes.includes(storedValue) ? storedValue : "system";
	const [systemDark, setSystemDark] = useState(media.matches);
	const isDark = theme === "dark" || (theme === "system" && systemDark);

	useEffect(() => {
		const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", isDark);
	}, [isDark]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme: setValue, isDark }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = (): ThemeContextValue => {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
	return ctx;
};
