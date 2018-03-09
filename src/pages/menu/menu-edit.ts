import {Component, ElementRef} from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';
import {FormGroup, Validators, FormBuilder} from "@angular/forms";
import {ApiService} from "../../providers/api-service";
import {TranslateService} from "ng2-translate";

@Component({
  selector: 'modal-menu-edit',
  templateUrl: 'menu-edit.html'
})
export class MenuEdit {
  item: any;
  currentCompany: any;
  menuItem: FormGroup;
  menuService: ApiService;
  translation: any;
  locale = 'uk';
  locations: any;
  fileLogo: File;

  constructor(public viewCtrl: ViewController, public navParams: NavParams, private formBuilder: FormBuilder, public translate: TranslateService, private element: ElementRef) {
    this.item = navParams.get('item');
    this.currentCompany = navParams.get('currentCompany');
    this.menuService = navParams.get('menuService');
    this.translation = navParams.get('translation');

    this.menuService.get('companies/'+this.currentCompany.id+'/locations').subscribe((data) => {
      this.locations = data;
    });

    this.menuItem = this.formBuilder.group({
      id: [''],
      name_uk: ['', Validators.required],
      description_uk: [''],
      name_en: [''],
      description_en: [''],
      price: ['', Validators.required],
      location_id: [''],
    });
    if(this.item){
      this.menuItem.setValue({
        id: this.item.id,
        name_uk: this.getItemTranslation('uk', 'name'),
        description_uk: this.getItemTranslation('uk', 'description'),
        name_en: this.getItemTranslation('en', 'name'),
        description_en: this.getItemTranslation('en', 'description'),
        price: this.item.price,
        location_id: this.item.location_id || '',
      });
    }
  }

  getItemTranslation(locale, field){
    if(this.item && this.item.translations){
      let result = this.item.translations.find(trans => {
        if(trans.locale == locale){
          return true;
        }
      });
      return result ? result[field] : null;
    }
  }

  addMenuItem(){
    if(this.menuItem.value.id) {
      this.menuService.put('menu/' + this.menuItem.value.id, this.menuItem.value).toPromise().then(
        data => {
          if(data && this.fileLogo){
            return this.menuService.makeFileRequest('menu/'+this.menuItem.value.id+'/logo', [], this.fileLogo).toPromise()
          }else{
            return new Promise((resolve, reject) => {data ? resolve(data) : reject(data)});
          }
        }
      ).then(
        data => this.viewCtrl.dismiss(data),
        error => console.log(error)
      );
    }else {
      this.menuService.makeFileRequest('menu', Object.assign(this.menuItem.value, {'company_id': this.currentCompany.id}), this.fileLogo).subscribe(
        data => this.viewCtrl.dismiss(data),
        error => this.menuService.handleError(error)
      );
    }
  }

  changeLogo(event) {
    let reader = new FileReader();
    let image = this.element.nativeElement.querySelector('.logo');

    reader.onload = (e) =>{
      image.src = e.target['result'];
    };
    reader.readAsDataURL(event.target.files[0]);

    this.fileLogo = event.target.files[0];

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
