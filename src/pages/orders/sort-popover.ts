import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
    selector: 'sort-popover',
    template: `<ion-list radio-group [(ngModel)]="selected" (ionChange)="dismiss()">
              <ion-item *ngFor="let item of sorting">
                <ion-label>{{item.name}}</ion-label>
                <ion-radio value="{{item.value}}"></ion-radio>
              </ion-item>
            </ion-list>`,
})
export class SortPopover {
    sorting: Array<any> = [];
    original: string;
    selected: string;

    constructor(
        private navParams: NavParams,
        public viewCtrl: ViewController
    ) {}

    ngOnInit() {
        if (this.navParams.data) {
            this.sorting = this.navParams.data.sorting;
            this.original = this.navParams.data.selected;
            this.selected = this.navParams.data.selected;
        }
    }

    dismiss() {
        if (this.original != this.selected) {
            this.viewCtrl.dismiss(this.selected);
        }
    }
}
