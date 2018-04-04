import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    template: `
    <ion-list class="popover-page">
      <button ion-item (click)="menu()">{{translation['Menu']}}</button>
      <button ion-item (click)="edit()">{{translation['Edit']}}</button>
    </ion-list>
  `,
})
export class PopoverPage {
    public company: any;
    public translation: any;
    constructor(public viewCtrl: ViewController, public params: NavParams) {
        this.company = params.data.company;
        this.translation = params.get('translation');
    }

    edit() {
        this.viewCtrl.dismiss({ action: 'edit', company: this.company });
    }

    menu() {
        this.viewCtrl.dismiss({ action: 'menu', company: this.company });
    }
}
