import { Component } from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';
import {FormGroup, Validators, FormBuilder} from "@angular/forms";
import {ApiService} from "../../providers/api-service";

@Component({
  selector: 'modal-menu',
  templateUrl: 'menu-item.html',
})
export class MenuItem {
  item: any;
  menuOption: FormGroup;
  menuService: ApiService;
  translation: any;
  locale = 'uk';

  constructor(public viewCtrl: ViewController, public navParams: NavParams, private formBuilder: FormBuilder) {
    this.item = navParams.get('item');
    this.menuService = navParams.get('menuService');
    this.translation = navParams.get('translation');

    this.menuOption = this.formBuilder.group({
      id: [null],
      name_uk: ['', Validators.required],
      name_en: [''],
      price: ['', Validators.required],
      //count: [0],
    });
  }

  getItemTranslation(item, locale, field){
    if(item && item.translations){
      let result = item.translations.find(trans => {
        if(trans.locale == locale){
          return true;
        }
      });
      if(result){
        return result[field];
      }
    }
  }

  addMenuOption(item){
    if(this.menuOption.value.id){
      this.menuService.put('options/'+this.menuOption.value.id, this.menuOption.value).subscribe(
        data => {
          this.menuOption.reset();
          this.item.options.forEach((val, i) => {
            if(val.id == data.id){
              return this.item.options[i] = data;
            }
          });
        }
      );
    }else {
      this.menuService.post('options', Object.assign(this.menuOption.value, {'menu_item_id': item.id})).subscribe(
        data => {
          this.menuOption.reset();
          if(!this.item.options){
            this.item.options = [];
          }
          this.item.options.push(data)
        }
      );
    }
  }

  editOption(item){
    if(item){
      this.menuOption.patchValue({
        id: item.id,
        name_uk: this.getItemTranslation(item, 'uk', 'name'),
        name_en: this.getItemTranslation(item, 'en', 'name'),
        price: item.price,
      });
    }
  }

  removeMenuOption(option){
    if(confirm(this.translation['delete_confirm'])) {
      this.menuService.delete('options/' + option.id).subscribe(
        data => {
          let index = this.item.options.indexOf(option, 0);
          if (data.hasOwnProperty('success') && index > -1) {
            this.item.options.splice(index, 1);
          }
        }
      );
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
