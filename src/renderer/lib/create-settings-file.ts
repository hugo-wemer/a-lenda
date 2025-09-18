export function createSettingsFile(data: any) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  return URL.createObjectURL(blob)
}
