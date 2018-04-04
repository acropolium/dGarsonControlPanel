import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    template: `
    <ion-list class="popover-page">
      <button ion-item (click)="edit()">{{translation['Edit']}}</button>
      <button ion-item (click)="remove()">{{translation['Delete']}}</button>
    </ion-list>
  `,
})
export class PopoverMenuItem {
    public item: any;
    public translation: any;
    constructor(public viewCtrl: ViewController, public params: NavParams) {
        this.item = params.data.item;
        this.translation = params.get('translation');
    }

    edit() {
        this.viewCtrl.dismiss({ action: 'edit', item: this.item });
    }

    remove() {
        this.viewCtrl.dismiss({ action: 'remove', item: this.item });
    }
}
