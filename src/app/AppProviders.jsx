import DemoProvider from '../features/admin/DemoProvider'
import InventoryProvider from '../features/inventory/InventoryProvider'
import StoreProvider from '../features/storefront/StoreProvider'
import { BrowserRouter } from 'react-router'
import ThemeProvider from '../features/theme/ThemeProvider'

export default function AppProviders({ children }) {
  return <BrowserRouter><ThemeProvider><DemoProvider><InventoryProvider><StoreProvider>{children}</StoreProvider></InventoryProvider></DemoProvider></ThemeProvider></BrowserRouter>
}
