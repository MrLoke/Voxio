export const formatTypingText = (users: string[]) => {
  const count = users.length;
  if (count === 0) return "";
  if (count === 1) return `${users[0]} pisze...`;
  if (count === 2) return `${users.join(" i ")} piszą...`;
  return `${users.slice(0, 2).join(", ")} i ${count - 2} inni piszą...`;
};
