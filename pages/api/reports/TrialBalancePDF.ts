import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { TrialBalanceReport } from "./TrialBalance";

// Register fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default async function generateTrialBalancePDF(
  trialBalance: TrialBalanceReport,
  startDate: string,
  endDate: string
) {
  const accountRows = Object.values(trialBalance.accounts).map((account) => {
    const debit = account.normal_side === "debit" ? account.balance : "";
    const credit = account.normal_side === "credit" ? account.balance : "";
    return {
      name: account.name,
      debit: debit.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      credit: credit.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
    };
  });

  const totalDebit = trialBalance.total_debit.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const totalCredit = trialBalance.total_credit.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const documentDefinition: TDocumentDefinitions = {
    content: [
      {
        text: "Trial Balance",
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
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto"],

          body: [
            [
              {
                text: "Account Name",
                style: "tableHeader",
              },
              {
                text: "Debit",
                style: "tableHeader",
              },
              {
                text: "Credit",
                style: "tableHeader",
              },
            ],
            ...accountRows.map((account) => [
              { text: account.name, style: "tableCell" },
              { text: account.debit, style: "tableCell" },
              { text: account.credit, style: "tableCell" },
            ]),
            [
              { text: "Total", bold: true, style: "tableHeader" },
              { text: totalDebit, bold: true, style: "tableHeader" },
              { text: totalCredit, bold: true, style: "tableHeader" },
            ],
          ],
        },
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
