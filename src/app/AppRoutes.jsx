import StoreLayout from '../layouts/StoreLayout'
import HomePage from '../features/storefront/pages/HomePage'
import ShopPage from '../features/storefront/pages/ShopPage'
import ShopProductPage from '../features/storefront/pages/ShopProductPage'
import CartPage from '../features/storefront/pages/CartPage'
import CheckoutPage from '../features/storefront/pages/CheckoutPage'
import AccountPage from '../features/storefront/pages/AccountPage'
import {StoreCategories,WishlistPage,ContactPage,StoreNotFound} from '../features/storefront/pages/CollectionPages'
import OrdersPage from '../features/orders/pages/OrdersPage'
import OrderDetailsPage from '../features/orders/pages/OrderDetailsPage'
import ProductDetailsPage from '../features/inventory/pages/ProductDetailsPage'
import CategoriesPage from '../features/inventory/pages/CategoriesPage'
import StockAdjustmentPage from '../features/inventory/pages/StockAdjustmentPage'
import SkuGeneratorPage from '../features/inventory/pages/SkuGeneratorPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import CreateDocumentPage from '../features/documents/pages/CreateDocumentPage'
import InvoicesPage from '../features/invoices/pages/InvoicesPage'
import CustomersPage from '../features/customers/pages/CustomersPage'
import UsersPage from '../features/users/pages/UsersPage'
import SettingsPage from '../features/settings/pages/SettingsPage'
import SalesReportsPage from '../features/reports/pages/SalesReportsPage'
import AdminLayout from '../layouts/AdminLayout'
import AddProductPage from '../features/inventory/pages/AddProductPage'
import ProductsPage from '../features/inventory/pages/ProductsPage'
import StockMovementsPage from '../features/inventory/pages/StockMovementsPage'
import QuotationsPage from '../features/quotations/pages/QuotationsPage'
import { Navigate, Route, Routes } from 'react-router'
import AuthLayout from '../layouts/AuthLayout'
import AuthPage from '../features/auth/pages/AuthPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="sku-generator" element={<SkuGeneratorPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/:category" element={<CategoriesPage />} />
        <Route path="stock-adjustments" element={<StockAdjustmentPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<AddProductPage />} />
        <Route path="stock-movements" element={<StockMovementsPage />} />
        <Route path="quotations" element={<QuotationsPage />} />
        <Route path="quotations/new" element={<CreateDocumentPage key="quotation" kind="quotation" />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/new" element={<CreateDocumentPage key="invoice" kind="invoice" />} />
        <Route path="sales-reports" element={<SalesReportsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
        <Route path="/login" element={<AuthPage key="login" mode="login" />} />
        <Route path="/forgot-password" element={<AuthPage key="reset" mode="reset" />} />
      </Route>
      <Route element={<StoreLayout />}>
        <Route index element={<HomePage/>}/>
        <Route path="shop" element={<ShopPage/>}/>
        <Route path="shop/:id" element={<ShopProductPage/>}/>
        <Route path="categories" element={<StoreCategories/>}/>
        <Route path="categories/:category" element={<ShopPage/>}/>
        <Route path="cart" element={<CartPage/>}/>
        <Route path="checkout" element={<CheckoutPage/>}/>
        <Route path="profile" element={<AccountPage/>}/>
        <Route path="wishlist" element={<WishlistPage/>}/>
        <Route path="contact" element={<ContactPage/>}/>
        <Route path="*" element={<StoreNotFound/>}/>
      </Route>
    </Routes>
  )
}
