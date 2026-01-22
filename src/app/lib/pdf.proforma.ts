import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { variable64 } from 'src/assets/logo';
import { Product } from '../interfaces/product.interface';

import { company } from '../public/empresa';
import { Client } from '../interfaces/client.interface';

(pdfMake as any).vfs = pdfFonts.vfs;

const generatePDF = (
  products: Product[],
  reciboNo: string,
  subtotal: number,
  impuesto: number,
  total: number,
  fechaEmision: string | null,
  fechaVencimiento: string | null,
  client: Client,
) => {
  const formatMoney = (value: number | null) =>
    `S/. ${(value ?? 0).toFixed(2)}`;

  const tableBody = [
    [
      { text: 'Cantidad', style: 'tableHeader' },
      { text: 'Descripción', style: 'tableHeader' },
      { text: 'Precio Unitario', style: 'tableHeader', noWrap: true },
      { text: 'Precio Total', style: 'tableHeader', noWrap: true },
    ],
    ...products.map((product) => [
      product.count.toString(),
      product.description,
      `${formatMoney(product.priceU)}`,
      `${formatMoney(product.priceT)}`,
      // `S/. ${product.priceU}`,
      // `S/. ${product.priceT}`,
    ]),
  ];

  const totalGeneral = products.reduce(
    (sum, product) => sum + product.priceT,
    0,
  );

  const content: any[] = [];

  content.push({
    columns: [
      { image: variable64.miVar, width: 80 },
      {
        text: company.description,
        style: 'descripcion',
        alignment: 'center',
        fontSize: 9,
      },
      {
        stack: [
          { text: `PROFORMA | N°: ${reciboNo}`, style: 'header' },
          { text: `Fecha emisión: ${fechaEmision}`, style: 'subheader' },
          {
            text: `Fecha vencimiento: ${
              fechaVencimiento !== null ? fechaVencimiento : 'Indefinido'
            }`,
            style: 'subheader',
          },
        ],
        alignment: 'right',
      },
    ],
  });

  // content.push({ text: '\n' });
  content.push({
    canvas: [
      {
        type: 'line',
        x1: 0,
        y1: 0, // Punto inicial
        x2: 516,
        y2: 0, // Punto final (ajusta según el ancho)
        lineWidth: 1, // Grosor de la línea
        lineColor: '#000000', // Color de la línea
      },
    ],
    margin: [0, 10, 0, 10], // Espaciado arriba y abajo
  });

  content.push({
    columns: [
      {
        stack: [
          { text: 'Vendedor', style: 'title' },
          {
            text: [
              { text: 'Razón Social: ' },
              { text: company.name, italics: true },
            ],
          },

          {
            text: [{ text: 'RUC: ' }, { text: company.doc, italics: true }],
          },
          {
            text: [
              { text: 'Teléfono 1: ' },
              { text: company.phone1, italics: true },
            ],
          },
          {
            text: [
              { text: 'Teléfono 2: ' },
              { text: company.phone2, italics: true },
            ],
          },
          {
            text: [
              { text: 'Dirección: ' },
              { text: company.address, italics: true },
            ],
          },

          // { text: `Razón Social: ${company.name}` },
          // { text: `RUC: ${company.doc}` },
          // { text: `Teléfono 1: ${company.phone1}` },
          // { text: `Teléfono 2: ${company.phone2}` },
          // { text: `Dirección: ${company.address}` },
        ],
        alignment: 'lift',
      },

      {
        stack: [
          { text: 'Cliente', style: 'title' },
          {
            text: [{ text: 'Nombre: ' }, { text: client.name, italics: true }],
          },
          {
            text: [{ text: 'RUC: ' }, { text: client.doc, italics: true }],
          },
          // {
          //   text: [
          //     { text: 'Teléfono 1: ' },
          //     { text: client.phone1, italics: true },
          //   ],
          // },
          // {
          //   text: [
          //     { text: 'Teléfono 2: ' },
          //     { text: client.phone2, italics: true },
          //   ],
          // },
          {
            text: [
              { text: 'Dirección: ' },
              { text: client.address, italics: true },
            ],
          },

          // { text: `Nombre: ${client.name}` },
          // { text: `RUC: ${client.doc}` },
          // { text: `Teléfono 1: ${client.phone1}` },
          // { text: `Teléfono 2: ${client.phone2}` },
          // { text: `Dirección: ${client.address}` },
        ],
      },
    ],
  });

  content.push({ text: '\n' });

  content.push({
    layout: 'headerLineOnly',
    fontSize: 11,
    table: {
      headerRows: 1,
      widths: ['auto', '*', 'auto', 'auto'],
      body: tableBody,
    },
    margin: [0, 10, 0, 10],
  });

  content.push({
    columns: [
      { text: '', width: '*' },
      {
        stack: [
          // {
          //   text: `SUBTOTAL: S/. ${subtotal}`,
          //   alignment: 'right',
          //   margin: [0, 0, 0, 0],
          // },
          // {
          //   text: `I.V.A: $ ${impuesto}`,
          //   alignment: 'right',
          //   margin: [0, 0, 0, 0],
          // },

          {
            // text: `TOTAL: S/. ${total}`,
            text: `TOTAL: ${formatMoney(subtotal)}`,
            style: 'total',
            alignment: 'right',
            margin: [0, 5, 0, 0],
          },
        ],
      },
    ],
  });

  // content.push({
  //   columns: [
  //     {
  //       stack: [
  //         {
  //           text: 'USUARIO: Juan Luis Guerra',
  //         },
  //         {
  //           text: 'COND. DE PAGO: Transferencia bancaria',
  //         },
  //         {
  //           text: 'CUENTAS BANCARIAS: BBVA: 1234567898766, CCP:234345222',
  //         },
  //       ],
  //       absolutePosition: { x: 40, y: 750 },
  //     },
  //   ],
  // });

  const styles = {
    header: {
      fontSize: 14,
      bold: true,
    },
    title: {
      fontSize: 13,
      bold: true,
    },
    subheader: {
      fontSize: 12,
      margin: [0, 0, 0, 0],
    },
    tableHeader: {
      bold: true,
      fontSize: 12,
      color: 'black',
    },
    total: {
      fontSize: 13,
      bold: true,
      color: '#1D6860',
    },
    descripcion: {
      fontSize: 10,
      bold: false,
    },
  };

  const docDefinition: any = {
    pageOrientation: 'portrait',
    header: (currentPage: number, pageCount: number) => {
      return {
        columns: [
          {
            text: `Proforma electrónica`,
            alignment: 'left',
            margin: [10, 10],
            fontSize: 9,
            color: 'gray',
          },
          {
            text: `Página ${currentPage} de ${pageCount}`,
            alignment: 'right',
            margin: [10, 10],
            fontSize: 9,
            color: 'gray',
          },
        ],
      };
    },
    content,
    styles,
    // footer: () => {
    //   return {
    //     text: `Todos los derechos reservados VlassCode :'v`,
    //     alignment: 'right',
    //     margin: [10, 10],
    //     italics: true,
    //     fontSize: 9,
    //     color: 'gray',
    //   };
    // },
  };

  pdfMake.createPdf(docDefinition).open();
};

export default generatePDF;
