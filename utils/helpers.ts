import type {RefObject} from "react";

export const printReport = (tableRef : RefObject<HTMLDivElement|null> , title:string) => {
    try {
        const printContents = tableRef?.current?.innerHTML;
        if (!printContents) return;
        const currentDate = new Date();

        const printWindow = window.open('', '_blank', 'width=800,height=600');

        if (!printWindow) {
            window.alert('Veuillez autoriser les pop-ups pour l\'impression');
            return;
        }

        // Enhanced print styles
        printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
 <style>
              @page {
                size: A4;
                margin: 2cm 1cm;
              }
              
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
                line-height: 1.4;
              }
              
              .print-header {
                position: running(header);
                text-align: center;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
              }
              
              @page {
                @top-center {
                  content: element(header);
                }
              }
              
              .print-header h1 {
                font-size: 18px;
                margin: 0 0 5px 0;
                color: #2c3e50;
              }
              
              .print-header .print-date {
                font-size: 12px;
                color: #666;
                margin-bottom: 10px;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                font-size: 12px;
              }
              
              th, td {
                border: 1px solid #ddd;
                padding: 6px;
                text-align: center;
              }
              
              th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              
              .no-print {
                display: none !important;
              }
              
              .page-break {
                page-break-after: always;
              }
              
              .cell-content {
                page-break-inside: avoid;
              }
              
              @media print {
                body {
                  padding: 0;
                }
                
                table {
                  page-break-inside: auto;
                }
                
                tr {
                  page-break-inside: avoid;
                  page-break-after: auto;
                }
              }
            </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${title}</h1>
            <div class="print-date">
              Généré le: ${currentDate.toLocaleDateString('fr-FR')} à ${currentDate.toLocaleTimeString('fr-FR')}
            </div>
          </div>
          ${printContents}
          <script>
            // Auto-print and close when loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 100);
            };
          </script>
        </body>
      </html>
    `);

        printWindow.document.close();

        // Fallback in case the window doesn't close automatically
        printWindow.addEventListener('afterprint', () => {
            setTimeout(() => {
                printWindow.close();
            }, 500);
        });

    } catch (error) {
        console.error('Error during printing:', error);
        window.alert('Une erreur est survenue lors de l\'impression');
    }
};