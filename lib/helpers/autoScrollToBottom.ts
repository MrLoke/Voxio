/**
 * Przewija widok do samego dołu
 * @param viewportElement Element widoku ScrollArea
 */
export const autoScrollToBottom = (viewportElement: HTMLElement) => {
  if (viewportElement) {
    setTimeout(() => {
      viewportElement.scrollTo({
        top: viewportElement.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  }
};
