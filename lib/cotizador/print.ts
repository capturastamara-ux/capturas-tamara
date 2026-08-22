const PRINT_STYLES = `
  @page {
    margin: 14mm;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: white !important;
    color: #1a1a1a;
  }

  @media print {
    thead {
      display: table-row-group;
    }

    tfoot {
      display: table-footer-group;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    .cotizador-print-area {
      border: none !important;
      padding: 0 !important;
      margin: 0 !important;
      background: white !important;
      box-shadow: none !important;
    }

    .overflow-x-auto {
      overflow: visible !important;
    }
  }
`;

function fallbackPrint(elementId: string) {
  document.body.dataset.cotizadorPrint = elementId;
  window.print();
  delete document.body.dataset.cotizadorPrint;
}

export function printCotizador(elementId: string) {
  const source = document.getElementById(elementId);
  if (!source) return;

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1024,height=768");
  if (!printWindow) {
    fallbackPrint(elementId);
    return;
  }

  const styles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style'),
  )
    .map((node) => node.outerHTML)
    .join("");

  printWindow.document.open();
  printWindow.document.write(`<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title></title>
    ${styles}
    <style>${PRINT_STYLES}</style>
  </head>
  <body>${source.outerHTML}</body>
</html>`);
  printWindow.document.close();

  const runPrint = () => {
    printWindow.focus();
    printWindow.print();
    window.setTimeout(() => {
      printWindow.close();
    }, 300);
  };

  if (printWindow.document.readyState === "complete") {
    runPrint();
  } else {
    printWindow.addEventListener("load", runPrint, { once: true });
    window.setTimeout(runPrint, 800);
  }
}
