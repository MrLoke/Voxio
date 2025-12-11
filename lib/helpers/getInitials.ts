/**
 * Generuje maksymalnie dwie inicjały z ciągu (pierwszą literę z pierwszego słowa
 * i pierwszą literę z drugiego słowa).
 * @param name Ciąg wejściowy (np. imię i nazwisko).
 * @returns Inicjały w dużych literach (np. "JD", "A").
 */
export const getInitials = (name: string): string => {
  // 1. Oczyść i podziel ciąg na słowa
  const words = name
    .trim()
    .split(/\s+/) // Podziel po spacji/wielu spacjach
    .filter((word) => word.length > 0);

  let initials = "";

  if (words.length === 0) {
    // Brak słów lub ciąg pusty
    return "";
  }

  // 2. Dodaj pierwszą literę pierwszego słowa
  initials += words[0][0];

  // 3. Jeśli istnieje drugie słowo, dodaj jego pierwszą literę
  if (words.length >= 2) {
    initials += words[1][0];
  }

  // 4. Zwróć wynik w dużych literach
  return initials.toUpperCase();
};

// 1. Definicja Palety Kolorów
// Używamy kodów HEX lub nazw kolorów CSS. Zmień je na kolory pasujące do Twojej aplikacji.
const COLOR_PALETTE: string[] = [
  "#F44336", // Czerwony
  "#E91E63", // Różowy
  "#9C27B0", // Fioletowy
  "#3F51B5", // Indygo
  "#2196F3", // Niebieski
  "#00BCD4", // Cyjan
  "#009688", // Turkusowy
  "#4CAF50", // Zielony
  "#FFC107", // Bursztynowy
  "#FF9800", // Pomarańczowy
];

/**
 * Prosta, niekryptograficzna funkcja haszująca String, przekształcająca go na liczbę.
 * Używa prostego algorytmu 'sdbm'.
 * @param str Ciąg wejściowy (np. nazwa użytkownika lub ID).
 * @returns Liczba całkowita reprezentująca hasz.
 */
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char; // hash * 31 + char, ale szybciej
    hash |= 0; // Konwersja na 32-bitową liczbę całkowitą ze znakiem
  }
  return hash;
};

/**
 * Wybiera stały kolor z palety na podstawie unikalnego identyfikatora.
 * @param identifier Unikalny ciąg (np. 'John Doe' lub 'user-12345').
 * @returns Kod koloru (string) zdefiniowany w COLOR_PALETTE.
 */
export const getAvatarColor = (identifier: string): string => {
  // Upewniamy się, że hasz jest zawsze nieujemny
  const hash = Math.abs(hashCode(identifier));

  // Wybieramy indeks z palety: hash modulo rozmiar palety
  const index = hash % COLOR_PALETTE.length;

  return COLOR_PALETTE[index];
};

// export const getInitials = (name: string) => {
//   return (
//     name
//       .match(/(\b\S)?/g)
//       ?.join("")
//       .match(/(^\S|\S$)?/g)
//       ?.join("")
//       .toUpperCase() || name[0].toUpperCase()
//   );
// };
