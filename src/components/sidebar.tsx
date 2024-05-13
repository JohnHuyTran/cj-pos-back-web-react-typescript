import { ReactElement, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { withStyles } from "@mui/styles";
import { Link, useLocation } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import MuiListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LoyaltyOutlinedIcon from "@mui/icons-material/LoyaltyOutlined";
import PresentToAllIcon from "@mui/icons-material/PresentToAll";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StoreMallDirectoryIcon from "@mui/icons-material/StoreMallDirectory";
import SettingsIcon from "@mui/icons-material/Settings";
import SwapHorizontalCircleIcon from "@mui/icons-material/SwapHorizontalCircle";
import { useAppSelector, useAppDispatch } from "../store/store";
import { changeState } from "store/slices/nav-slice";
import imgLogo from "assets/images/CJlogo.jpeg";
import Menu from "@mui/icons-material/Menu";
import { ShoppingCartSharp } from "@mui/icons-material";
import { MAINMENU, SUBMENU } from "utils/enum/permission-enum";
import {
  isAllowMainMenuPermission,
  isAllowSubMenuPermission,
} from "utils/role-permission";

const drawerWidth = 240;
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
}));

const ListItemButton = withStyles({
  root: {
    "&$selected": {
      backgroundColor: "#E7FFE9!important",
      color: "#36C690",
      "& .MuiListItemIcon-root": {
        color: "#36C690",
      },
    },
    "&$selected:hover": {
      backgroundColor: "#FFFFFF",
      color: "#676767",
      "& .MuiListItemIcon-root": {
        color: "#676767",
      },
    },
    "&:hover": {
      cursor: "pointer",
      backgroundColor: "#E7FFE9",
      color: "#36C690",
      "& .MuiListItemIcon-root": {
        color: "#36C690",
      },
    },
  },
  selected: {},
})(MuiListItemButton);

interface Props {}

export default function Sidebar({}: Props): ReactElement {
  const location = useLocation();
  const selectedByPath = (path: string) => {
    const pathname = location.pathname.split("/")[1];
    if (!!path && pathname.length !== 0) {
      return pathname === path;
    } else if (!path && pathname.length === 0) {
      return true;
    }
  };
  const [open, setOpen] = useState(true);
  const [openSellMenu, setOpenSellMenu] = useState(
    selectedByPath("sale-limit-time") ||
      selectedByPath("barcode-discount") ||
      selectedByPath("tax-invoice"),
  );
  const [openPickUpMenu, setOpenPickUpMenu] = useState(
    selectedByPath("check-order") ||
      selectedByPath("dc-check-order") ||
      selectedByPath("supplier-check-order"),
  );
  const [openTransferMenu, setOpenTransferMenu] = useState(
    selectedByPath("stock-transfer-rt") || selectedByPath("stock-transfer"),
  );
  const [openWithDrawMenu, setOpenWithDrawMenu] = useState(
    selectedByPath("transfer-out-destroy") ||
      selectedByPath("transfer-out") ||
      selectedByPath("transfer-out-raw-masterial") ||
      selectedByPath("create-purchase-branch"),
  );
  const [openProductInfoMenu, setOpenProductInfoMenu] = useState(
    selectedByPath("product-master") ||
      selectedByPath("stock-balance") ||
      selectedByPath("stock-movement"),
  );
  const [openExpenseMenu, setOpenExpenseMenu] = useState(
    selectedByPath("expense") ||
      selectedByPath("cash-statement") ||
      selectedByPath("close-saleshift") ||
      selectedByPath("open-end"),
  );
  const [openSettingsMenu, setOpenSettingsMenu] = useState(
    selectedByPath("reserves"),
  );
  const [openCheckStockMenu, setOpenCheckStockMenu] = useState(
    selectedByPath("audit-plan") ||
      selectedByPath("stock-count") ||
      selectedByPath("stock-adjustment") ||
      selectedByPath("audit-history"),
  );

  const navState = useAppSelector((state) => state.navigator.state);

  const [disableMainMenuOrderReceive, setDisableMainMenuOrderReceive] =
    useState(true);
  const [disableMainMenuStockTransfer, setDisableMainMenuStockTransfer] =
    useState(true);
  const [disableMainMenuSell, setDisableMainMenuSell] = useState(true);
  const [disableMainMenuTransferOut, setDisableMainMenuTransferOut] =
    useState(true);
  const [disableMainMenuProductInfo, setDisableMainMenuProductInfo] =
    useState(true);
  // const [disableMainMenuPurchaseBranch, setDisableMainMenuPurchaseBranch] = useState(true);
  const [disableMainMenuExpense, setDisableMainMenuExpense] = useState(true);
  const [disableMainMenuSettings, setDisableMainMenuSettings] = useState(true);
  // const [disableMainMenuCheckStock, setDisableMainMenuCheckStock] = useState(true);

  const [disableSubMenuOROrderReceive, setDisableSubMenuOROrderReceive] =
    useState(true);
  const [disableSubMenuORStockDiff, setDisableSubMenuORStockDiff] =
    useState(true);
  const [disableSubMenuORSupplier, setDisableSubMenuORSupplier] =
    useState(true);

  const [disableSubMenuSTStockRequest, setDisableSubMenuSTStockRequest] =
    useState(true);
  const [disableSubMenuSTStockTransfer, setDisableSubMenuSTStockTransfer] =
    useState(true);
  const [disableSubMenuTaxInvoice, setDisableSubMenuTaxInvoice] =
    useState(true);
  const [disableSubMenuStockBalance, setDisableSubMenuStockBalance] =
    useState(true);
  const [disableSubMenuStockMovement, setDisableSubMenuStockMovement] =
    useState(true);
  const [
    disableSubMenuCreatePurchaseBranch,
    setDisableSubMenuCreatePurchaseBranch,
  ] = useState(true);
  const [disableSubMenuExpense, setDisableSubMenuExpense] = useState(true);
  const [disableSubMenuSettings, setDisableSubMenuSettings] = useState(true);
  const [disableSubMenuCloseSaleShift, setDisableSubMenuCloseSaleShift] =
    useState(true);
  const [disableSubMenuCashStatement, setDisableSubMenuCashStatement] =
    useState(true);
  const [disableSubMenuOpenEnd, setDisableSubMenuOpenEnd] = useState(true);

  const [disableSubMenuSaleSaleLimit, setDisableSubMenuSaleSaleLimit] =
    useState(true);
  const [disableSubMenuSaleDiscount, setDisableSubMenuSaleDiscount] =
    useState(true);
  const [disableSubMenuTODestroy, setDisableSubMenuTODestroy] = useState(true);
  const [disableSubMenuTOStoreUse, setDisableSubMenuTOStoreUse] =
    useState(true);
  const [disableSubMenuProductMaster, setDisableSubMenuProductMaster] =
    useState(true);
  // const [disableSubMenuAuditPlan, setDisableSubMenuAuditPlan] = useState(true);

  useEffect(() => {
    setOpen(navState);
    setDisableMainMenuOrderReceive(
      isAllowMainMenuPermission(MAINMENU.ORDER_RECEIVE),
    );
    setDisableMainMenuStockTransfer(
      isAllowMainMenuPermission(MAINMENU.STOCK_TRANSFER),
    );
    setDisableMainMenuSell(isAllowMainMenuPermission(MAINMENU.SALE));
    setDisableMainMenuTransferOut(
      isAllowMainMenuPermission(MAINMENU.TRANSFER_OUT),
    );
    setDisableMainMenuProductInfo(
      isAllowMainMenuPermission(MAINMENU.PRODUCT_INFO),
    );
    // setDisableMainMenuPurchaseBranch(isAllowMainMenuPermission(MAINMENU.PURCHASE_BRANCH));

    setDisableMainMenuExpense(isAllowMainMenuPermission(MAINMENU.EXPENSE));
    setDisableMainMenuSettings(isAllowMainMenuPermission(MAINMENU.APP_CONFIG));

    setDisableSubMenuSaleDiscount(
      isAllowSubMenuPermission(SUBMENU.SALE_DISCOUNT),
    );
    setDisableSubMenuSaleSaleLimit(
      isAllowSubMenuPermission(SUBMENU.SALE_SALE_LIMIT),
    );
    setDisableSubMenuTaxInvoice(
      isAllowSubMenuPermission(SUBMENU.SALE_TAX_INVOICE),
    );

    setDisableSubMenuOROrderReceive(
      isAllowSubMenuPermission(SUBMENU.OR_ORDER_RECEIVE),
    );
    setDisableSubMenuORStockDiff(isAllowSubMenuPermission(SUBMENU.OR_DIFF));
    setDisableSubMenuORSupplier(isAllowSubMenuPermission(SUBMENU.OR_SUPPLIER));

    setDisableSubMenuSTStockRequest(
      isAllowSubMenuPermission(SUBMENU.ST_REQUEST),
    );
    setDisableSubMenuSTStockTransfer(
      isAllowSubMenuPermission(SUBMENU.ST_TRANSFER),
    );

    setDisableSubMenuTODestroy(isAllowSubMenuPermission(SUBMENU.TO_DESTROY));
    setDisableSubMenuTOStoreUse(isAllowSubMenuPermission(SUBMENU.TO_STORE_USE));

    setDisableSubMenuStockBalance(
      isAllowSubMenuPermission(SUBMENU.PI_STOCK_BALANCE),
    );
    setDisableSubMenuStockMovement(
      isAllowSubMenuPermission(SUBMENU.PI_STOCK_MOVEMENT),
    );
    setDisableSubMenuProductMaster(
      isAllowSubMenuPermission(SUBMENU.PI_PRODUCT_MASTER),
    );

    setDisableSubMenuExpense(isAllowSubMenuPermission(SUBMENU.EX_EXPENSE));
    setDisableSubMenuSettings(isAllowSubMenuPermission(SUBMENU.EX_CONFIG));
    setDisableSubMenuCashStatement(
      isAllowSubMenuPermission(SUBMENU.CASH_STATEMENT),
    );

    setDisableSubMenuCreatePurchaseBranch(
      isAllowSubMenuPermission(SUBMENU.PR_CREATE_PURCHASE_BRANCH),
    );
    setDisableSubMenuCloseSaleShift(
      isAllowSubMenuPermission(SUBMENU.EX_CLOSE_SALE_SHIFT),
    );
    setDisableSubMenuOpenEnd(isAllowSubMenuPermission(SUBMENU.EX_OPEN_END));
  }, [navState]);

  const dispatch = useAppDispatch();

  const handleDrawerClose = () => {
    setOpen(false);
    dispatch(changeState(false));
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          boxShadow: "10px 10px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <DrawerHeader>
        <img src={imgLogo} alt="" width="50" />
        <div onClick={handleDrawerClose}>
          <ChevronLeftIcon color="primary" sx={{ marginRight: "-5px" }} />
          <Menu color="primary" />
        </div>
      </DrawerHeader>

      <List sx={{ marginTop: 2 }}>
        <Link to="/" style={{ textDecoration: "none", color: "#676767" }}>
          <ListItemButton
            key="HOME"
            selected={selectedByPath("")}
            id="mainMenuHome"
          >
            <ListItemIcon>
              <HomeOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="หน้าหลัก" style={{ marginLeft: -15 }} />
          </ListItemButton>
        </Link>

        <ListItemButton
          key="SELL"
          onClick={() => setOpenSellMenu(!openSellMenu)}
          style={{ display: disableMainMenuSell ? "none" : "" }}
        >
          <ListItemIcon>
            <ShoppingCartSharp />
          </ListItemIcon>
          <ListItemText primary="ขาย" style={{ marginLeft: -15 }} />
          {openSellMenu ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openSellMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link
              to="/sale-limit-time"
              style={{ textDecoration: "none", color: "#676767" }}
              id="subMenuSaleLimitTime"
            >
              <ListItemButton
                key="SALE LIMIT TINE"
                selected={selectedByPath("sale-limit-time")}
                sx={{
                  pl: 7,
                  display: disableSubMenuSaleSaleLimit ? "none" : "",
                }}
              >
                <ListItemText primary="กำหนดเวลา (งด) ขายสินค้า" />
              </ListItemButton>
            </Link>
          </List>
          <List component="div" disablePadding>
            <Link
              to="/barcode-discount"
              style={{ textDecoration: "none", color: "#676767" }}
              id="subMenuBarcodeDiscount"
            >
              <ListItemButton
                key="BARCODE DISCOUNT"
                selected={selectedByPath("barcode-discount")}
                sx={{
                  pl: 7,
                  display: disableSubMenuSaleDiscount ? "none" : "",
                }}
              >
                <ListItemText primary="ส่วนลดสินค้า" />
              </ListItemButton>
            </Link>
          </List>
          <List component="div" disablePadding>
            <Link
              to="/tax-invoice"
              style={{ textDecoration: "none", color: "#676767" }}
              id="subMenuTaxInvoice"
            >
              <ListItemButton
                key="TAX INVOICE"
                selected={selectedByPath("tax-invoice")}
                sx={{ pl: 7, display: disableSubMenuTaxInvoice ? "none" : "" }}
              >
                <ListItemText primary="ใบเสร็จ/ใบกำกับฉบับเต็ม" />
              </ListItemButton>
            </Link>
          </List>
        </Collapse>

        <ListItemButton
          onClick={() => setOpenPickUpMenu(!openPickUpMenu)}
          id="mainMenuPickUp"
          style={{ display: disableMainMenuOrderReceive ? "none" : "" }}
        >
          <ListItemIcon>
            <LoyaltyOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="รับสินค้า" style={{ marginLeft: -15 }} />
          {openPickUpMenu ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openPickUpMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link
              to="/check-order"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuOROrderReceive ? "none" : "",
              }}
              id="subMenuCheckOrder"
            >
              <ListItemButton
                key="SALE"
                selected={selectedByPath("check-order")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="รับสินค้า" />
              </ListItemButton>
            </Link>
            <Link
              to="/dc-check-order"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuORStockDiff ? "none" : "",
              }}
              id="subMenuDCCheckOrder"
            >
              <ListItemButton
                key="dcConfirmOrder"
                selected={selectedByPath("dc-check-order")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="ตรวจสอบผลต่างการรับสินค้า" />
              </ListItemButton>
            </Link>
            <Link
              to="/supplier-check-order"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuORSupplier ? "none" : "",
              }}
              id="subMenuSupplierCheckOrder"
            >
              <ListItemButton
                key="supplierCheckOrder"
                selected={selectedByPath("supplier-check-order")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="รับสินค้า จากผู้จำหน่าย" />
              </ListItemButton>
            </Link>
          </List>
        </Collapse>

        <ListItemButton
          onClick={() => setOpenTransferMenu(!openTransferMenu)}
          id="mainMenuTransfer"
          style={{ display: disableMainMenuStockTransfer ? "none" : "" }}
        >
          <ListItemIcon>
            <SwapHorizontalCircleIcon />
          </ListItemIcon>
          <ListItemText primary="โอนสินค้า" style={{ marginLeft: -15 }} />
          {openTransferMenu ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openTransferMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link
              to="/stock-transfer-rt"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuSTStockRequest ? "none" : "",
              }}
              id="subMenuStockTransferRt"
            >
              <ListItemButton
                key="StockTransferRt"
                selected={selectedByPath("stock-transfer-rt")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="สร้างแผนโอนสินค้าระหว่างสาขา/คลัง" />
              </ListItemButton>
            </Link>
            <Link
              to="/stock-transfer"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuSTStockTransfer ? "none" : "",
              }}
              id="subMenuStockTransfer"
            >
              <ListItemButton
                key="StockTransfer"
                selected={selectedByPath("stock-transfer")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="โอนสินค้าระหว่างสาขา/คลัง" />
              </ListItemButton>
            </Link>
          </List>
        </Collapse>

        <ListItemButton
          onClick={() => setOpenWithDrawMenu(!openWithDrawMenu)}
          id="mainMenuWithDraw"
          style={{ display: disableMainMenuTransferOut ? "none" : "" }}
        >
          <ListItemIcon>
            <PresentToAllIcon />
          </ListItemIcon>
          <ListItemText primary="เบิก" style={{ marginLeft: -15 }} />
          {openWithDrawMenu ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openWithDrawMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link
              to="/transfer-out-destroy"
              style={{ textDecoration: "none", color: "#676767" }}
              id="subMenuTransferOut"
            >
              <ListItemButton
                key="TransferOutDestroy"
                selected={selectedByPath("transfer-out-destroy")}
                sx={{ pl: 7, display: disableSubMenuTODestroy ? "none" : "" }}
              >
                <ListItemText primary="ทำลาย" />
              </ListItemButton>
            </Link>
            <Link
              to="/transfer-out"
              style={{ textDecoration: "none", color: "#676767" }}
              id="subMenuTransferOut"
            >
              <ListItemButton
                key="TransferOut"
                selected={selectedByPath("transfer-out")}
                sx={{ pl: 7, display: disableSubMenuTOStoreUse ? "none" : "" }}
              >
                <ListItemText primary="ใช้ในการทำกิจกรรม" />
              </ListItemButton>
            </Link>
            <Link
              to="/transfer-out-raw-masterial"
              style={{ textDecoration: "none", color: "#676767" }}
              id="subMenuTOMasterial"
            >
              <ListItemButton
                key="subMenuTOMasterial"
                selected={selectedByPath("transfer-out-raw-masterial")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="ขอใช้วัตถุดิบร้านบาว" />
              </ListItemButton>
            </Link>
            <Link
              to="/create-purchase-branch"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuCreatePurchaseBranch ? "none" : "",
              }}
              id="subMenuCreatePurchaseBranch"
            >
              <ListItemButton
                key="CreatePurchaseBranch"
                selected={selectedByPath("create-purchase-branch")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="ของใช้หน้าร้าน" />
              </ListItemButton>
            </Link>
          </List>
        </Collapse>
        <ListItemButton
          onClick={() => setOpenProductInfoMenu(!openProductInfoMenu)}
          id="mainMenuProductInfo"
          style={{ display: disableMainMenuProductInfo ? "none" : "" }}
        >
          <ListItemIcon>
            <StoreMallDirectoryIcon />
          </ListItemIcon>
          <ListItemText primary="ข้อมูลสินค้า" style={{ marginLeft: -15 }} />
          {openProductInfoMenu ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openProductInfoMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link
              to="/product-master"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuProductMaster ? "none" : "",
              }}
              id="subMenuProductMaster"
            >
              <ListItemButton
                key="ProductMaster"
                selected={selectedByPath("product-master")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="รายละเอียดสินค้า" />
              </ListItemButton>
            </Link>
            <Link
              to="/stock-balance"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuStockBalance ? "none" : "",
              }}
              id="subMenuStockBalance"
            >
              <ListItemButton
                key="StockBalance"
                selected={selectedByPath("stock-balance")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="สินค้าคงคลัง" />
              </ListItemButton>
            </Link>
            <Link
              to="/stock-movement"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuStockMovement ? "none" : "",
              }}
              id="subMenuStockMovement"
            >
              <ListItemButton
                key="StockMovement"
                selected={selectedByPath("stock-movement")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="ความเคลื่อนไหวของสินค้า" />
              </ListItemButton>
            </Link>
          </List>
        </Collapse>
        <ListItemButton
          onClick={() => setOpenExpenseMenu(!openExpenseMenu)}
          id="mainMenuExpense"
          style={{ display: disableMainMenuExpense ? "none" : "" }}
        >
          <ListItemIcon>
            <StoreMallDirectoryIcon />
          </ListItemIcon>
          <ListItemText primary="สรุปรับ-จ่าย" style={{ marginLeft: -15 }} />
          {openExpenseMenu ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openExpenseMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link
              to="/expense"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuExpense ? "none" : "",
              }}
              id="subMenuExpense"
            >
              <ListItemButton
                key="Expense"
                selected={selectedByPath("expense")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="ค่าใช้จ่าย" />
              </ListItemButton>
            </Link>
            <Link
              to="/cash-statement"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuCashStatement ? "none" : "",
              }}
              id="subMenuCashStatement"
            >
              <ListItemButton
                key="CashStatement"
                selected={selectedByPath("cash-statement")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="เงินฝากขาด - เกิน" />
              </ListItemButton>
            </Link>
            <Link
              to="/close-saleshift"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuCloseSaleShift ? "none" : "",
              }}
              id="subMenuCloseSaleShift"
            >
              <ListItemButton
                key="CloseSaleShift"
                selected={selectedByPath("close-saleshift")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="ปิดรหัสการขาย" />
              </ListItemButton>
            </Link>
            <Link
              to="/open-end"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuOpenEnd ? "none" : "",
              }}
              id="subMenuCashStatement"
            >
              <ListItemButton
                key="CashStatement"
                selected={selectedByPath("open-end")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="ปิดรอบการขาย" />
              </ListItemButton>
            </Link>
          </List>
        </Collapse>
        <ListItemButton
          onClick={() => setOpenSettingsMenu(!openSettingsMenu)}
          id="mainMenuSettings"
          style={{ display: disableMainMenuSettings ? "none" : "" }}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="ตั้งค่า" style={{ marginLeft: -15 }} />
          {openSettingsMenu ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openSettingsMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link
              to="/reserves"
              style={{
                textDecoration: "none",
                color: "#676767",
                display: disableSubMenuSettings ? "none" : "",
              }}
              id="subMenuSettings"
            >
              <ListItemButton
                key="Settings"
                selected={selectedByPath("reserves")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="ค่าใช้จ่ายสำรอง" />
              </ListItemButton>
            </Link>
          </List>
        </Collapse>
        <ListItemButton
          onClick={() => setOpenCheckStockMenu(!openCheckStockMenu)}
          id="mainMenuCheckStock"
          // style={{ display: disableMainMenuCheckStock ? 'none' : '' }}
        >
          <ListItemIcon>
            <AllInboxIcon />
          </ListItemIcon>
          <ListItemText primary="ตรวจนับสต๊อก" style={{ marginLeft: -15 }} />
          {openCheckStockMenu ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openCheckStockMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <Link
              to="/audit-plan"
              style={{
                textDecoration: "none",
                color: "#676767",
                // display: disableSubMenuAuditPlan ? 'none' : '',
              }}
              id="subMenuAuditPlan"
            >
              <ListItemButton
                key="AuditPlan"
                selected={selectedByPath("audit-plan")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="สร้างแผนตรวจนับสต๊อก" />
              </ListItemButton>
            </Link>
            <Link
              to="/stock-count"
              style={{
                textDecoration: "none",
                color: "#676767",
              }}
              id="subMenuStockCount"
            >
              <ListItemButton
                key="StockCount"
                selected={selectedByPath("stock-count")}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="ตรวจนับสต๊อก (SC)" />
              </ListItemButton>
            </Link>
            <Link
              to="/stock-adjustment"
              style={{
                textDecoration: "none",
                color: "#676767",
              }}
              id="subMenuStockAdjustment"
            >
              <ListItemButton
                key="StockAdjustment"
                selected={selectedByPath("stock-adjustment")}
                // onClick={() => handleListItemClick(17)}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="รายละเอียดตรวจนับสต๊อก (SA)" />
              </ListItemButton>
            </Link>
            <Link
              to="/audit-history"
              style={{
                textDecoration: "none",
                color: "#676767",
              }}
              id="subMenuAuditHistory"
            >
              <ListItemButton
                key="AuditHistory"
                selected={selectedByPath("audit-history")}
                // onClick={() => handleListItemClick(18)}
                sx={{ pl: 7 }}
              >
                <ListItemText primary="ประวัตินับสต๊อก" />
              </ListItemButton>
            </Link>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}
