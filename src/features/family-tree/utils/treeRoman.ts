// Convert generation number to Roman numeral (Đời I, Đời II, Đời III,...)
export function toRoman(num: number): string {
  if (!num || num <= 0) return 'I'
  const romanMap: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let result = ''
  let n = num
  for (const [val, roman] of romanMap) {
    while (n >= val) {
      result += roman
      n -= val
    }
  }
  return result || `${num}`
}
