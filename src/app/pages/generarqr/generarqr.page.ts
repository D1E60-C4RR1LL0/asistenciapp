import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import QRCode from 'qrcode';

@Component({
  selector: 'app-generarqr',
  templateUrl: './generarqr.page.html',
  styleUrls: ['./generarqr.page.scss'],
})
export class GenerarqrPage implements OnInit {
  classId: string = '';
  qrCodeUrl: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Obtener el `classId` desde los parámetros de la ruta
    this.classId = this.route.snapshot.paramMap.get('id') || '';
    this.generateQRCode();
  }

  async generateQRCode() {
    if (this.classId) {
      this.qrCodeUrl = await QRCode.toDataURL(this.classId);
    }
  }
}
