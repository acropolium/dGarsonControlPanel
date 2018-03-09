import { Component } from '@angular/core';
import {NavController, NavParams, ModalController, ActionSheetController} from 'ionic-angular';
import {ApiService} from "../../providers/api-service";
import {LocationEdit} from "./location-edit";
import {TranslateService} from "ng2-translate";
import {MenuPage} from "../menu/menu";

@Component({
  selector: 'page-locations',
  templateUrl: 'locations.html'
})
export class LocationsPage {
  currentCompany: any;
  items: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apiService: ApiService,
    public translate: TranslateService,
    public modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.currentCompany = navParams.get('company');
  }

  ionViewDidLoad() {
    if(this.currentCompany){
      this.apiService.get('companies/' + this.currentCompany.id + '/locations').subscribe(
        data => this.items = data
      );
    }
  }

  presentEditModal(item){
    //this.translate.get(['Address', 'Phone', 'Cancel', 'Save', 'Create']).subscribe((translation: string) => {

      let menuEditModal = this.modalCtrl.create(LocationEdit, {item: item, currentCompany: this.currentCompany, apiService: this.apiService/*, translation: translation*/});

      menuEditModal.onDidDismiss(data => {
        if(data) {
          let newItem = true;
          this.items.forEach((val, i) => {
            if (val.id == data.id) {
              newItem = false;
              return this.items[i] = data;
            }
          });
          if (newItem) {
            this.items.push(data)
          }
        }
      });
      menuEditModal.present();
    //});
  }

  presentActionSheet(item) {
    this.translate.get(['Choose action', 'Menu', 'Cancel', 'Edit', 'Delete', 'delete_confirm']).subscribe((translation: string) => {
      let actionSheet = this.actionSheetCtrl.create({
        title: translation['Choose action'],
        buttons: [
          {
            text: translation['Menu'],
            icon: 'options',
            handler: () => {
              this.navCtrl.push(MenuPage, {
                company: this.currentCompany,
                location: item
              });
            }
          },
          {
            text: translation['Edit'],
            icon: 'create',
            handler: () => {
              this.presentEditModal(item);
            }
          },
          {
            text: translation['Delete'],
            role: 'destructive',
            icon: 'trash',
            handler: () => {
              if(confirm(translation['delete_confirm'])){
                this.removeLocation(item);
              }
            }
          },
          {
            text: translation['Cancel'],
            role: 'cancel',
            icon: 'close'
          },
        ]
      });
      actionSheet.present();
    });
  }

  removeLocation(item){
    this.apiService.delete('locations/' + item.id).subscribe(
      data => {
        let index = this.items.indexOf(item, 0);
        if (data.hasOwnProperty('success') && index > -1) {
          this.items.splice(index, 1);
        }
      }
    );
  }

}
