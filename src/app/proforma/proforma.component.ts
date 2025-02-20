import { Component, OnInit } from '@angular/core';
import { Impuesto, Product } from '../interfaces/product.interface';
import { Client } from '../interfaces/client.interface';
import generatePDF from '../lib/pdf.proforma';
import { client } from '../public/client';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-proforma',
  templateUrl: './proforma.component.html',
  styles: [],
})
export class ProformaComponent implements OnInit {
  products: Product[] = [];
  clients: Client[] = client;

  issueDate: string | null = null;
  expirationDate: string | null = null;
  clientId: string = '';

  productForm: Product = {
    count: 1,
    priceU: null,
    priceT: 0,
    description: '',
    id: 0,
  };

  productEdit: Product = {
    count: 1,
    priceU: null,
    priceT: 0,
    description: '',
    id: 0,
  };

  productId: number | null = null;

  impuesto: Impuesto = {
    subtotal: 0,
    impuesto: 0,
    total: 0,
    tipoImpuesto: 'I.V.A',
    porcentajeImpuesto: 20,
  };

  constructor(private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.obtenerProductos();
    this.impuestos();
  }

  calcularTotal() {
    if (this.productForm.priceU !== null) {
      this.productForm.priceT =
        this.productForm.count * this.productForm.priceU;
    }
  }

  guardar_productos_local() {
    const nuevoItem: any = {
      count: this.productForm.count,
      priceU: this.productForm.priceU,
      priceT: this.productForm.priceT,
      description: this.productForm.description,
      id: Date.now(),
    };

    // Obtener items existentes del localStorage
    const itemsGuardados = this.obtenerProductos();

    // Agregar el nuevo item
    itemsGuardados.push(nuevoItem);

    // Ordenar de manera descendente
    itemsGuardados.sort((a: any, b: any) => b.id - a.id);

    // Guardar en localStorage
    localStorage.setItem('products', JSON.stringify(itemsGuardados));

    // Limpiar los campos después de guardar
    this.limpiarCampos();
    this.impuestos();
  }

  private obtenerProductos() {
    const itemsGuardados: any = JSON.parse(
      localStorage.getItem('products') || '[]'
    );

    this.products = itemsGuardados;
    this.impuestos();
    return itemsGuardados;
  }

  private limpiarCampos() {
    this.productForm.count = 1;
    this.productForm.priceU = null;
    this.productForm.priceT = 0;
    this.productForm.description = '';
    this.impuestos();
  }

  eliminar_productos() {
    localStorage.removeItem('products');
    this.obtenerProductos();
  }

  eliminar_producto() {
    const productId = this.productId;
    if (productId !== null) {
      const products: Product[] = JSON.parse(
        localStorage.getItem('products') || '[]'
      );

      const newProducts: Product[] = [];
      for (let product of products) {
        if (product.id !== productId) {
          newProducts.push(product);
        }
      }
      localStorage.setItem('products', JSON.stringify(newProducts));
      this.obtenerProductos();
    }
  }

  mostrar_producto_editar(productId: number) {
    const products: Product[] = this.obtenerProductos();

    for (let product of products) {
      if (product.id === productId) {
        this.productEdit = product;

        break;
      }
    }
  }

  editar_producto() {
    const products: Product[] = this.obtenerProductos();
    const index = products.findIndex((p) => p.id === this.productEdit.id);
    if (index !== -1) {
      products[index] = this.productEdit;
    }
    localStorage.setItem('products', JSON.stringify(products));

    this.obtenerProductos();
  }

  calcularTotalEdit() {
    if (this.productEdit.priceU !== null) {
      this.productEdit.priceT =
        this.productEdit.count * this.productEdit.priceU;
    }
  }

  cancelar_editar_producto() {
    this.obtenerProductos();
  }

  impuestos() {
    const products: any = JSON.parse(localStorage.getItem('products') || '[]');
    let subtotal = 0;
    for (let product of products) {
      subtotal += product.priceT;
    }

    let porcentaje = this.impuesto.porcentajeImpuesto / 100;
    let impuesto = subtotal * porcentaje;

    this.impuesto.subtotal = subtotal;
    this.impuesto.impuesto = impuesto;
    this.impuesto.total = subtotal + impuesto;
  }

  public generar_proforma() {
    const products: Product[] = this.obtenerProductos();
    const reciboNo = 'A-0000001';

    // Fecha actual
    this.issueDate !== null
      ? (this.issueDate = this.datePipe.transform(this.issueDate, 'dd-MM-yyyy'))
      : (this.issueDate = 'Sin fecha');

    // Fecha de expericación
    this.expirationDate !== null
      ? (this.expirationDate = this.datePipe.transform(
          this.expirationDate,
          'dd-MM-yyyy'
        ))
      : (this.expirationDate = 'Sin fecha');

    let clientData: Client = {
      name: '',
      doc: '',
      phone1: '',
      phone2: '',
      address: '',
      id: '',
    };

    // Buscando datos del cliente mediante id
    for (let client of this.clients) {
      if (client.id === +this.clientId) {
        clientData = client;
        break;
      }
    }

    generatePDF(
      products,
      reciboNo,
      this.impuesto.subtotal,
      this.impuesto.impuesto,
      this.impuesto.total,
      this.issueDate,
      this.expirationDate,
      clientData
    );

    // Restaurar data
    this.issueDate = null;
    this.expirationDate = null;
  }
}
