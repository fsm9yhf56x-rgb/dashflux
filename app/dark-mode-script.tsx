export function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            const darkMode = localStorage.getItem('darkMode');
            const isDark = darkMode ? darkMode === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
              document.documentElement.classList.add('dark');
            }
          } catch (e) {}
        `,
      }}
    />
  );
}