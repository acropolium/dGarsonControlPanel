import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    template: `
    <ion-list class="popover-page">
      <button ion-item (click)="edit()">Редактировать</button>
      <button ion-item (click)="remove()">Delete</button>
    </ion-list>
  `,
})
export class PopoverLocationsPage {
    public company: any;
    public location: any;

    constructor(public viewCtrl: ViewController, public params: NavParams) {
        debugger;
        this.company = params.data.company;
        this.location = params.data.location;
    }

    edit() {
        this.viewCtrl.dismiss({
            action: 'edit',
            company: this.company,
            location: this.location,
        });
    }
    remove() {
        this.viewCtrl.dismiss({
            action: 'remove',
            company: this.company,
            location: this.location,
        });
    }
}
