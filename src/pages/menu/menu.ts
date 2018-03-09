import { Component } from '@angular/core';
import {NavController, NavParams, ModalController, ActionSheetController, PopoverController} from 'ionic-angular';
import { ApiService } from '../../providers/api-service';
import {MenuItem} from "./menu-item";
import {TranslateService} from "ng2-translate/ng2-translate";
import {MenuEdit} from "./menu-edit";
import {PopoverMenuItem} from "../popover/popover-menu-item";

@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {
  selectedItem: any;
  currentCompany: any;
  currentLocation: any;
  items: any;
  user: any;
  showForm: boolean = false;
  currency: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private menuService: ApiService,
    public modalCtrl: ModalController,
    public actionSheetCtrl: ActionSheetController,
    public translate: TranslateService,
    private apiService: ApiService,
    public popoverCtrl: PopoverController,

  ) {
    // If we navigated to this page, we will have an item available as a nav param
    this.popoverCtrl = popoverCtrl;
    this.currentCompany = navParams.get('company');
    this.currentLocation = navParams.get('location') ? navParams.get('location') : 0;
    this.selectedItem = navParams.get('item');
    this.currency = navParams.get('company').currency;

    if(this.currentCompany){
      this.menuService.get('companies/' + this.currentCompany.id + '/menu', {per_page: 500, location_id: this.currentLocation.id}).subscribe((data) => {
          this.items = data.data;

          data.data.map((menu) => {
              if (menu.location_id) {
                  this.menuService.get('location/'+ menu.location_id).subscribe((location) => {
                      menu.location = location[0] ? location[0] : null;
                  });
                 return menu;
              } else {
                menu.location = null;
                return menu;
              }
          });
          }
      );
    }

  }

  onGesture(){
    console.log('play music');
    //this.file.play();
  };

  removeMenu(item){
    this.menuService.delete('menu/' + item.id).subscribe(
      data => {
        let index = this.items.indexOf(item, 0);
        if (data.hasOwnProperty('success') && index > -1) {
          this.items.splice(index, 1);
        }
      }
    );
  }

   presentPopover(item, event) {
    this.translate.get(['Edit', 'Delete', 'delete_confirm']).subscribe((translation: string) => {
      let popover = this.popoverCtrl.create(PopoverMenuItem, {item: item, ev: event, translation: translation});
      popover.onDidDismiss(data => {
        if (data && data.action && data.item) {
          if (data.action == 'edit') {
            this.presentEditModal(item, event);
          }
          if (data.action == 'remove') {
            if (confirm(translation['delete_confirm'])) {
              this.removeMenu(item);
            }
          }
        }
      });
      popover.present({ev: event});
    });
  }

  presentMenuItemModal(item) {
    this.translate.get(['Name', 'Price', 'Cancel', 'Save', 'ukrainian', 'english', 'delete_confirm']).subscribe((translation: string) => {
      this.modalCtrl.create(MenuItem, {item: item, menuService: this.menuService, translation: translation}).present();
    });
  }

  presentEditModal(item, $event){
    this.translate.get(['Name', 'Price', 'Description', 'Cancel', 'Save', 'Create', 'ukrainian', 'english', 'Common', 'Locations']).subscribe((translation: string) => {

      let menuEditModal = this.modalCtrl.create(MenuEdit, {item: item, currentCompany: this.currentCompany, menuService: this.menuService, translation: translation});

      menuEditModal.onDidDismiss(data => {
        if(data) {
          if(data.location_id && data.location_id != this.currentLocation.id){
            let index = this.items.indexOf(item, 0);
            if(index > -1){
              this.items.splice(index, 1);
            }
            return data;
          }
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
      menuEditModal.present()
    });
    if ($event) {
      $event.stopPropagation();
    }

  }

  presentActionSheet(item) {
    this.translate.get(['Choose action', 'Options', 'Cancel', 'Edit', 'Delete', 'delete_confirm']).subscribe((translation: string) => {
      let actionSheet = this.actionSheetCtrl.create({
        title: translation['Choose action'],
        buttons: [
          {
            text: translation['Options'],
            icon: 'options',
            handler: () => {
              this.presentMenuItemModal(item);
            }
          },
          {
            text: translation['Edit'],
            icon: 'create',
            handler: () => {
              this.presentEditModal(item, false);
            }
          },
          {
            text: translation['Delete'],
            role: 'destructive',
            icon: 'trash',
            handler: () => {
              if(confirm(translation['delete_confirm'])){
                this.removeMenu(item);
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

}
