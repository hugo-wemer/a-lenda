export const fromModbusCode = (e: unknown): string | undefined => {
  const err = (typeof e === 'string' ? { message: e } : (e as any)) ?? {}
  const code: number | undefined =
    typeof err?.modbusCode === 'number'
      ? err.modbusCode
      : typeof err?.err?.modbusCode === 'number'
        ? err.err.modbusCode
        : undefined

  if (code != null) {
    const map: Record<number, string> = {
      1: 'Illegal Function',
      2: 'Illegal Data Address',
      3: 'Illegal Data Value',
      4: 'Slave Device Failure',
      5: 'Acknowledge',
      6: 'Slave Device Busy',
      8: 'Memory Parity Error',
      10: 'Gateway Path Unavailable',
      11: 'Gateway Target Device Failed to Respond',
    }
    return map[code] ?? `Modbus Exception ${code}`
  }

  return err?.code ?? err?.message
}
