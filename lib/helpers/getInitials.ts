/**
 * Generuje maksymalnie dwie inicjały z ciągu (pierwszą literę z pierwszego słowa
 * i pierwszą literę z drugiego słowa).
 * @param name Ciąg wejściowy (np. imię i nazwisko).
 * @returns Inicjały w dużych literach (np. "JD", "A").
 */
export const getInitials = (name: string): string => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  let initials = "";

  if (words.length === 0) {
    return "";
  }

  initials += words[0][0];

  if (words.length >= 2) {
    initials += words[1][0];
  }

  return initials.toUpperCase();
};

const COLOR_PALETTE: string[] = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#3F51B5",
  "#2196F3",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#FFC107",
  "#FF9800",
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
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
};

/**
 * Wybiera stały kolor z palety na podstawie unikalnego identyfikatora.
 * @param identifier Unikalny ciąg (np. 'John Doe' lub 'user-12345').
 * @returns Kod koloru (string) zdefiniowany w COLOR_PALETTE.
 */
export const getAvatarColor = (identifier: string): string => {
  const hash = Math.abs(hashCode(identifier));

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
