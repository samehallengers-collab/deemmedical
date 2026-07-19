Move the language selector out of the navbar menu and into the homepage entry experience. The first time a user visits the homepage, show a centered language-selection screen with English and Arabic as two large, clearly labeled options. After the user picks a language, it persists in localStorage and the rest of the homepage content is revealed. The navbar will no longer contain the language toggle.

What will change:
- Remove the LanguageToggle from the navbar and mobile menu.
- Add a new LanguageGate component on the homepage.
- Render the language gate before any other homepage content when no language has been chosen yet (or on every fresh homepage visit, depending on whether we want to keep the gate always visible).
- Persist the chosen language with the existing LanguageContext and localStorage logic.
- Update the Index page to conditionally show the gate first, then fade/switch to the main site layout.

Technical approach:
- Keep the LanguageProvider in App.tsx unchanged.
- Add a minimal `hasSelectedLang` flag in localStorage or use `app_lang` as the signal. Defaulting the app to no selection means the gate shows until the user chooses.
- Use the existing `setLang` from LanguageContext to apply the selected language, which also sets `dir="rtl"` for Arabic.
- Create a centered full-viewport language gate with the brand logo, a short greeting, and two large buttons: "English" and "العربية".
- Once a language is selected, render the normal homepage content (Navbar, Hero, etc.).
- Add fallback translation keys for the language gate itself.

Open decisions:
- Should the language gate appear only once (first visit) or every time the user returns to the homepage?
- Should the navbar still show a small language indicator (not a menu item) for users who want to switch later, or should switching only happen on the homepage?