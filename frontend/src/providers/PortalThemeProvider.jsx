import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "portal-theme";
const PortalThemeContext = createContext(null);

export function PortalThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window === "undefined") {
            return "light";
        }

        return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
    };

    return (
        <PortalThemeContext.Provider
            value={{
                theme,
                isDarkMode: theme === "dark",
                toggleTheme,
            }}
        >
            {children}
        </PortalThemeContext.Provider>
    );
}

export function usePortalTheme() {
    const context = useContext(PortalThemeContext);

    if (!context) {
        throw new Error("usePortalTheme must be used within a PortalThemeProvider.");
    }

    return context;
}