import { Route } from 'react-router-dom'

import { Router } from 'lib/electron-router-dom'

import { MainScreen } from './screens/main'
import { OfflineSettings } from './screens/offline-settings'

export function AppRoutes() {
  return (
    <Router
      main={
        <>
          <Route path="/" element={<MainScreen />} />
          <Route path="/offline-settings" element={<OfflineSettings />} />
        </>
      }
    />
  )
}
