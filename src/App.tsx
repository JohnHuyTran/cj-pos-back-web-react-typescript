import React, { useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Switch, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Home from "./pages/home";
import CheckOrder from "./pages/check-order";
import DCCheckOrder from "./pages/dc-check-order";
import SupplierCheckOrder from "./pages/supplier-check-order";
import TaxInvoice from "./pages/tax-invoice";
import StockTransfer from "./pages/stock-transfer";
import StockTransferRt from "./pages/stock-transfer-rt";
import LoginForm from "./components/login/login-form";
import BarcodeDiscount from "./pages/barcode-discount/barcode-discount";
import SaleLimitTime from "./pages/sale-limit-time/sale-limit-time";

import { useAppDispatch, useAppSelector } from "./store/store";
import { featchBranchListAsync } from "./store/slices/search-branches-slice";
import { featchAuthorizedBranchListAsync } from "./store/slices/authorized-branch-slice";
import Notification from "./pages/notification";
import TransferOut from "./pages/transfer-out/transfer-out";
import StockBalance from "./pages/stock/stock-balance";
import TransferOutDestroy from "./pages/transfer-out-destroy/transfer-out-destroy";
import StockMovement from "./pages/stock/stock-movement";
import CreatePurchaseBranch from "./pages/purchase-branch-request/create-purchase-branch";
import { featchMasterStockMovementTypeListAsync } from "./store/slices/master/stock-movement-type-slice";
import ProductMaster from "./pages/stock/product-master";
import TORawMasterial from "./pages/transfer-out-raw-masterial/transfer-out-raw-masterial";
import Expense from "./pages/accounting/expense";
import Reserves from "./pages/settings/reserves";
import CashStatement from "./pages/accounting/cash-statement";
import { featchMasterExpenseListAsync } from "./store/slices/master/expense-list-slice";
import { featchExpenseDetailAsync } from "./store/slices/accounting/accounting-slice";
import AuditPlan from "./pages/check-stock/audit-plan";

import CloseSaleShift from "./pages/accounting/close-saleshift";
import StockCount from "./pages/check-stock/stock-count";
import StockAdjustment from "./pages/check-stock/stock-adjustment";
import AuditHistory from "./pages/check-stock/audit-history";
import OpenEnd from "./pages/accounting/open-end";
const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  paddingLeft: "5px",
  paddingRight: "5px",
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function App2() {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const navState = useAppSelector((state) => state.navigator.state);

  useEffect(() => {
    setOpen(navState);
  }, [navState]);

  if (!auth || !auth.isLogin) {
    return <LoginForm />;
  } else {
    dispatch(featchBranchListAsync());
    dispatch(featchAuthorizedBranchListAsync());
    dispatch(featchMasterStockMovementTypeListAsync());
    dispatch(featchMasterExpenseListAsync());
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Navbar />
      <Sidebar />
      <Main open={open}>
        <DrawerHeader />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/notification" component={Notification} />
          <Route path="/barcode-discount" component={BarcodeDiscount} />
          <Route path="/tax-invoice" component={TaxInvoice} />
          <Route path="/sale-limit-time" component={SaleLimitTime} />
          <Route path="/check-order" component={CheckOrder} />
          <Route path="/dc-check-order" component={DCCheckOrder} />
          <Route path="/supplier-check-order" component={SupplierCheckOrder} />
          <Route path="/stock-transfer" component={StockTransfer} />
          <Route path="/stock-transfer-rt" component={StockTransferRt} />
          <Route path="/transfer-out" component={TransferOut} />
          <Route path="/transfer-out-destroy" component={TransferOutDestroy} />
          <Route
            path="/transfer-out-raw-masterial"
            component={TORawMasterial}
          />
          <Route path="/stock-balance" component={StockBalance} />
          <Route path="/stock-movement" component={StockMovement} />
          <Route
            path="/create-purchase-branch"
            component={CreatePurchaseBranch}
          />
          <Route path="/product-master" component={ProductMaster} />
          <Route path="/expense" component={Expense} />
          <Route path="/reserves" component={Reserves} />
          <Route path="/audit-plan" component={AuditPlan} />
          <Route path="/stock-count" component={StockCount} />
          <Route path="/close-saleshift" component={CloseSaleShift} />
          <Route path="/cash-statement" component={CashStatement} />
          <Route path="/stock-adjustment" component={StockAdjustment} />
          <Route path="/open-end" component={OpenEnd} />
          <Route path="/audit-history" component={AuditHistory} />
        </Switch>
      </Main>
    </Box>
  );
}
