import { Box, Button, Container } from "@mui/material";
import React, { useEffect } from "react";
import ExpenseDetail from "../../components/accounting/expense/expense-detail";
import TitleHeader from "../../components/title-header";
import { periodMockData } from "../../mockdata/branch-accounting";
import {
  addNewItem,
  featchExpenseDetailAsync,
  initialItems,
  updateItemRows,
  updateSummaryRows,
  updateToInitialState,
} from "../../store/slices/accounting/accounting-slice";
import { useAppDispatch } from "../../store/store";
import { useStyles } from "../../styles/makeTheme";

import SearchExpense from "../../components/accounting/expense/search-expense";
import { useTranslation } from "react-i18next";
import { setInit } from "../../store/sessionStore";
import CloseSaleShiftSearch from "../../components/accounting/close-saleshift/close-saleshift-search";

export default function CloseSaleShift() {
  const { t } = useTranslation(["expense", "common"]);
  return (
    <Container maxWidth="xl">
      <TitleHeader title={t("title.closeSaleShift")} />
      <Box mt={3}>
        <CloseSaleShiftSearch />
      </Box>
    </Container>
  );
}
