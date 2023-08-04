import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { IncomeStatementReport } from "./IncomeStatement";
// import { IncomeStatementReport } from "./IncomeStatement";

// Register fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default async function generateIncomeStatementPDF(
  incomeStatement: IncomeStatementReport,
  startDate: string,
  endDate: string
) {
  const revenueRows = Object.values(incomeStatement.revenue).map((revenue) => ({
    name: revenue.name,
    amount: revenue.balance.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    }),
  }));
  const expensesRows = Object.values(incomeStatement.expenses).map(
    (expense) => ({
      name: expense.name,
      amount: `(${expense.balance.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })})`,
    })
  );
  const netIncome = incomeStatement.net_income.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const documentDefinition: TDocumentDefinitions = {
    content: [
      {
        text: "Income Statement",
        style: "header",
        alignment: "center",
      },
      {
        text: `From ${startDate} to ${endDate}`,
        style: "subheader",
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      {
        text: "Revenue",
        style: "h2",
        margin: [0, 10, 0, 5],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto"],

          body: [
            [
              {
                text: "Account Name",
                style: "tableHeader",
              },
              {
                text: "Amount",
                style: "tableHeader",
              },
            ],
            ...revenueRows.map((revenue) => [
              {
                text: revenue.name,
                style: "tableCell",
              },
              {
                text: revenue.amount,
                style: "tableCell",
              },
            ]),
          ],
        },
      },
      {
        text: "Expenses",
        style: "h2",
        margin: [0, 10, 0, 5],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto"],

          body: [
            [
              {
                text: "Account Name",
                style: "tableHeader",
              },
              {
                text: "Amount",
                style: "tableHeader",
              },
            ],
            ...expensesRows.map((expense) => [
              {
                text: expense.name,
                style: "tableCell",
              },
              {
                text: expense.amount,
                style: "tableCell",
              },
            ]),
          ],
        },
      },
      {
        text: "Net Income",
        style: "h2",
        margin: [0, 10, 0, 5],
      },
      {
        text: netIncome,
        style: "h1",
        margin: [0, 0, 0, 10],
      },
    ],
    styles: {
      header: {
        fontSize: 24,
        bold: true,
      },
      subheader: {
        fontSize: 16,
        bold: true,
      },
      h1: {
        fontSize: 20,
        bold: true,
      },
      h2: {
        fontSize: 14,
        bold: true,
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: "black",
        fillColor: "#f2f2f2",
        alignment: "left",
      },
      tableCell: {
        fontSize: 13,
        color: "black",
        alignment: "left",
      },
    },
  };

  const pdfDocument = pdfMake.createPdf(documentDefinition);
  return pdfDocument;
}
