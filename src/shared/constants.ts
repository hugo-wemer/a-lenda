export const ENVIRONMENT = {
  IS_DEV: process.env.NODE_ENV === 'development',
}

export const PLATFORM = {
  IS_MAC: process.platform === 'darwin',
  IS_WINDOWS: process.platform === 'win32',
  IS_LINUX: process.platform === 'linux',
}

export const IPC = {
  APP_VERSION: {
    FETCH: 'app: fetch',
    UPDATE: 'app: update',
  },
  PORTS: {
    FETCH: 'ports: fetch',
  },
  EQUIPMENTS: {
    FETCH: 'equipments: fetch',
  },
  CSV: {
    FETCH: 'csv: fetch',
  },
  CONNECT: {
    FETCH: 'connect: fetch',
    CREATE: 'connect: create',
    DELETE: 'connect: delete',
  },
  READING: {
    FETCH: 'reading: fetch',
    UPDATE: 'reading: update',
  },
  READING_STATUS: {
    FETCH: 'reading status: fetch',
  },
  SETTING: {
    FETCH: 'setting: fetch',
    UPDATE: 'setting: update',
  },
  SETTINGS: {
    UPDATE: 'settings: update',
  },
  LANGUAGE: {
    FETCH: 'language: fetch',
    UPDATE: 'language: update',
  },
}
