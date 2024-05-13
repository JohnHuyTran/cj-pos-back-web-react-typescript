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

export default function Expense() {
  const { t } = useTranslation(["expense", "common"]);
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [edit, setEdit] = React.useState(false);
  const onClose = () => {
    setOpen(false);
  };

  const onOpenNew = async () => {
    setOpen(true);
    setEdit(false);
    setInit("N");
    await dispatch(updateToInitialState());
    await dispatch(updateSummaryRows([]));
    await dispatch(updateItemRows([]));
    await dispatch(initialItems([]));
    await dispatch(addNewItem(null));
    // await dispatch(updateSummaryRows([]));
    // await dispatch(updateItemRows([]));
  };
  return (
    <Container maxWidth="xl">
      <TitleHeader title={t("title.documentSearch")} />
      <Box mt={3}>
        <SearchExpense />
      </Box>
    </Container>
  );
}
