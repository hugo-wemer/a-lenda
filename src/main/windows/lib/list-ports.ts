import { SerialPort } from 'serialport'

export async function listPorts() {
  try {
    const ports = await SerialPort.list()
    return ports.map(port => port.path)
  } catch (err) {
    console.error('Erro ao listar portas:', err)
    return []
  }
}
