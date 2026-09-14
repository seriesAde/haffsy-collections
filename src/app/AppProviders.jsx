import { useAuth } from '../features/auth/AuthContext'
import AuthProvider from '../features/auth/AuthProvider'
import DemoProvider from '../features/admin/DemoProvider'
import InventoryProvider from '../features/inventory/InventoryProvider'
import StoreProvider from '../features/storefront/StoreProvider'
import { BrowserRouter } from 'react-router'
import ThemeProvider from '../features/theme/ThemeProvider'

function DataProviders({children}) { const {user}=useAuth(); return <DemoProvider key={user?.id||'guest'}><InventoryProvider><StoreProvider>{children}</StoreProvider></InventoryProvider></DemoProvider> }
export default function AppProviders({ children }) {
  return <BrowserRouter><ThemeProvider><AuthProvider><DataProviders>{children}</DataProviders></AuthProvider></ThemeProvider></BrowserRouter>
}
