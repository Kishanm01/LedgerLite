import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { BalanceSheetReport } from ".";
import { TDocumentDefinitions } from "pdfmake/interfaces";

// Register fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default async function generatePDFDocument(
  balanceSheet: BalanceSheetReport,
  startDate: string,
  endDate: string
) {
  const assetsRows = Object.values(balanceSheet.assets).map((asset) => ({
    name: asset.name,
    balance: asset.balance.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    }),
  }));
  const liabilitiesRows = Object.values(balanceSheet.liabilities).map(
    (liability) => ({
      name: liability.name,
      balance: liability.balance.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
    })
  );
  const equityRows = Object.values(balanceSheet.equity).map((equity) => ({
    name: equity.name,
    balance: equity.balance.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    }),
  }));

  const totalAssets = balanceSheet.total_assets.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const totalLiabilities = balanceSheet.total_liabilities.toLocaleString(
    "en-US",
    { style: "currency", currency: "USD" }
  );
  const totalEquity = balanceSheet.total_equity.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const documentDefinition: TDocumentDefinitions = {
    content: [
      {
        text: "Balance Sheet",
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
        text: "Assets",
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
                text: "Balance",
                style: "tableHeader",
              },
            ],
            ...assetsRows.map((asset) => [
              {
                text: asset.name,
                style: "tableCell",
              },
              {
                text: asset.balance,
                style: "tableCell",
              },
            ]),
            [
              {
                text: "Total Assets",
                bold: true,
                style: "tableHeader",
              },
              {
                text: totalAssets,
                bold: true,
                style: "tableHeader",
              },
            ],
          ],
        },
      },
      {
        text: "Liabilities",
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
                text: "Balance",
                style: "tableHeader",
              },
            ],
            ...liabilitiesRows.map((liability) => [
              {
                text: liability.name,
                style: "tableCell",
              },
              {
                text: liability.balance,
                style: "tableCell",
              },
            ]),
            [
              {
                text: "Total Liabilities",
                bold: true,
                style: "tableHeader",
              },
              {
                text: totalLiabilities,
                bold: true,
                style: "tableHeader",
              },
            ],
          ],
          
          },
        },
        {
          text: "Equity",
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
                  text: "Balance",
                  style: "tableHeader",
                },
              ],
              ...equityRows.map((equity) => [
                {
                  text: equity.name,
                  style: "tableCell",
                },
                {
                  text: equity.balance,
                  style: "tableCell",
                },
              ]),
              [
                {
                  text: "Total Equity",
                  bold: true,
                  style: "tableHeader",
                },
                {
                  text: totalEquity,
                  bold: true,
                  style: "tableHeader",
                },
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
