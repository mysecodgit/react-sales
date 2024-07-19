import React from "react";
import { Navigate } from "react-router-dom";

// // Profile
import UserProfile from "../pages/Authentication/user-profile";

// // Authentication related pages
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";
import ForgetPwd from "../pages/Authentication/ForgetPassword";

// // Dashboard
import Dashboard from "../pages/Dashboard/index";
import Vendors from "../pages/Vendors";
import Customers from "../pages/Customers";
import WareHouses from "../pages/warehouses";
import Categories from "../pages/categories";
import Products from "../pages/products";
import Purchases from "../pages/purchase";
import CreatePurchase from "../pages/purchase/createPurchase";
import Accounts from "../pages/accounts";
import AccountTypes from "../pages/accountTypes";
import PurchasePayment from "../pages/purchase/puprchasePayment";
import Sales from "../pages/sales";
import CreateSale from "../pages/sales/createSale";
import SalesPayment from "../pages/sales/salesPayment";
import PurchaseReturns from "../pages/purchase_returns";
import CreatePurchaseReturn from "../pages/purchase_returns/createPurchaseReturn";
import PurchaseReturnPayment from "../pages/purchase_returns/puprchaseReturnPayment";
import SalesReturns from "../pages/sales_returns";
import CreateSaleReturn from "../pages/sales_returns/createSaleReturn";
import SalesReturnPayment from "../pages/sales_returns/salesReturnPayment";
import SystemMenues from "../pages/system_menues";
import SystemSubMenu from "../pages/system_sub_menu";
import SystemActions from "../pages/system_actions";
import Users from "../pages/users";
import UserPermissions from "../pages/user_permissions";
import Expenses from "../pages/expense";
import CreateCheck from "../pages/expense/createNewCheck";
import MoneyTransfer from "../pages/money_transfer";
import ExcelExport from "../pages/falaad";
import InventoryTransfer from "../pages/inventory_transfer";
import MakeAdjustment from "../pages/products/make-adjustment";
import Adjustment from "../pages/products/ajustmentList";
import GeneralJournal from "../pages/general_journal";
import CreateGeneralJournal from "../pages/general_journal/newJournal";
import SalesInvoiceDetails from "../pages/sales/salesInvoice";
import SalesReturnInvoice from "../pages/sales_returns/returnInvoice";
import TrialBalance from "../pages/reports/trialBalance";
import BalanceSheet from "../pages/reports/balanceSheet";

const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },

  //profile
  { path: "/profile", component: <UserProfile /> },
  { path: "/users", component: <Users /> },
  { path: "/user-permissions", component: <UserPermissions /> },
  { path: "/account-types", component: <AccountTypes /> },
  { path: "/system-menu", component: <SystemMenues /> },
  { path: "/system-sub-menu", component: <SystemSubMenu /> },
  { path: "/system-actions", component: <SystemActions /> },
  { path: "/accounts", component: <Accounts /> },
  { path: "/vendors", component: <Vendors /> },
  { path: "/customers", component: <Customers /> },
  { path: "/warehouses", component: <WareHouses /> },
  { path: "/categories", component: <Categories /> },
  { path: "/products", component: <Products /> },
  { path: "/adjustments", component: <Adjustment /> },
  { path: "/adjustments/make-adjustment", component: <MakeAdjustment /> },
  { path: "/transfer_money", component: <MoneyTransfer /> },
  { path: "/general_journal", component: <GeneralJournal /> },
  { path: "/general_journal/new", component: <CreateGeneralJournal /> },
  {
    path: "/general_journal/edit/:JournalId",
    component: <CreateGeneralJournal />,
  },
  { path: "/transfer_inventory", component: <InventoryTransfer /> },

  { path: "/purchases", component: <Purchases /> },
  { path: "/purchases/new", component: <CreatePurchase /> },
  { path: "/purchase-returns", component: <PurchaseReturns /> },
  { path: "/purchase-returns/new", component: <CreatePurchaseReturn /> },
  // { path: "/purchases/:id/edit", component: <CreatePurchase /> },
  { path: "/purchase-payments", component: <PurchasePayment /> },
  { path: "/purchase-return-payments", component: <PurchaseReturnPayment /> },
  { path: "/sales", component: <Sales /> },
  { path: "/sales/new", component: <CreateSale /> },
  { path: "/sales/invoice/:id", component: <SalesInvoiceDetails /> },
  { path: "/sales-returns", component: <SalesReturns /> },
  { path: "/sales-returns/new", component: <CreateSaleReturn /> },
  { path: "/sales-returns/invoice/:id", component: <SalesReturnInvoice /> },
  { path: "/sales-payments", component: <SalesPayment /> },
  { path: "/sales-return-payments", component: <SalesReturnPayment /> },

  { path: "/checks", component: <Expenses /> },
  { path: "/checks/new", component: <CreateCheck /> },
  { path: "/checks/:checkId/edit", component: <CreateCheck /> },
  { path: "/falaad", component: <ExcelExport /> },

  { path: "/reports/trial_balance", component: <TrialBalance /> },
  { path: "/reports/balance_sheet", component: <BalanceSheet /> },

  // this route should be at the end of all other routes
  // eslint-disable-next-line react/display-name
  { path: "/", exact: true, component: <Navigate to="/dashboard" /> },
];

const publicRoutes = [
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPwd /> },
  { path: "/register", component: <Register /> },
];

export { authProtectedRoutes, publicRoutes };
