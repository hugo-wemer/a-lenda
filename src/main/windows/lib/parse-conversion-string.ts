type Conversion = { value: number; conversion: string }

export function parseConversionString(
  input: string,
  pairSep = '\\', // separador entre pares (backslash)
  kvSep = '=' // separador entre chave e valor
): Conversion[] {
  if (!input) return []

  return input
    .split(pairSep) // separa por "\"
    .map(s => s.trim())
    .filter(Boolean) // remove vazios
    .map(pair => {
      const [left, ...rest] = pair.split(kvSep) // só a 1ª "=" separa
      const right = rest.join(kvSep)
      const value = Number(left?.trim())
      const conversion = right?.trim() ?? ''
      if (!Number.isFinite(value) || right === undefined) return null
      return { value, conversion }
    })
    .filter((x): x is Conversion => x !== null)
}
