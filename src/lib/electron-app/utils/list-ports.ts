import { SerialPort } from 'serialport'

export async function listPorts() {
  try {
    const ports = await SerialPort.list() //.then(ports => {
    //  console.log(ports)
    //})
    // Retorna apenas o caminho (COM3, /dev/ttyUSB0 etc.)
    return ports.map(port => port.path)
  } catch (err) {
    console.error('Erro ao listar portas:', err)
    return []
  }
}
