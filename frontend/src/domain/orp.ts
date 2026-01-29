export function getOrpIndex(word: string) {
  const length = word.length;
  if (length === 0) {
    return 0;
  }

  let index = 1;
  if (length <= 5) {
    index = 1;
  } else if (length <= 9) {
    index = 2;
  } else if (length <= 13) {
    index = 3;
  } else if (length <= 17) {
    index = 4;
  } else {
    index = 4;
  }

  return Math.min(index, Math.max(0, length - 1));
}
