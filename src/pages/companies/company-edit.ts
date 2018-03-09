import {Component, ElementRef} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NavParams, ViewController} from "ionic-angular";
import {ApiService} from "../../providers/api-service";

@Component({
  selector:'company-edit',
  templateUrl: 'company-edit.html',
})

export class CompanyEdit {
  item: any;
  apiService: ApiService;
  companyForm: FormGroup;
  translation: any;
  fileLogo: File;
  currencyTypes: any;
  locale = 'uk';

  constructor(public navParams: NavParams, private formBuilder: FormBuilder, public viewCtrl: ViewController, private element: ElementRef){
    this.item = navParams.get('item');
    this.apiService = navParams.get('apiService');
    this.translation = navParams.get('translation');
    this.currencyTypes = [{currency: 'EUR'}, {currency: 'USD'}, {currency: 'UAH'}];
    this.companyForm = this.formBuilder.group({
      id: [''],
      name_uk: ['', Validators.required],
      address_uk: ['', Validators.required],
      description_uk: [''],
      description_en: [''],
      name_en: [''],
      address_en: [''],
      phone: ['', Validators.required],
      currency: ['', Validators.required]
    });

    if(this.item){
      this.companyForm.setValue({
          id: this.item.id,
          name_uk: this.getItemTranslation('uk', 'name'),
          address_uk: this.getItemTranslation('uk', 'address'),
          description_uk: this.getItemTranslation('uk', 'description'),
          name_en: this.getItemTranslation('en', 'name'),
          address_en: this.getItemTranslation('en', 'address'),
          description_en: this.getItemTranslation('en', 'address'),
          phone: this.item.phone,
          currency: this.item.currency
      });
      this.companyForm.patchValue(this.item);
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

  addCompany(){
    if(this.companyForm.value.id){
      this.apiService.put('companies/'+this.companyForm.value.id, this.companyForm.value).toPromise().then(
        data => {
          if(data && this.fileLogo){
            return this.apiService.makeFileRequest('companies/'+this.companyForm.value.id+'/logo', [], this.fileLogo).toPromise()
          }else{
            return new Promise((resolve, reject) => {data ? resolve(data) : reject(data)});
          }
        }
      ).then(
        data => this.viewCtrl.dismiss(data),
        error => console.log(error)
      );
    }else{
      this.apiService.makeFileRequest('companies', this.companyForm.value, this.fileLogo).subscribe(
        data => this.viewCtrl.dismiss(data),
        error => this.apiService.handleError(error)
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
