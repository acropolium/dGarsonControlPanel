import {Component, ElementRef, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NavParams, ViewController, Events} from "ionic-angular";
import {ApiService} from "../../providers/api-service";
import {TranslateService} from "ng2-translate/ng2-translate";

declare var google;

@Component({
  selector:'location-edit',
  templateUrl: 'location-edit.html',
})

export class LocationEdit {
  item: any;
  apiService: ApiService;
  currentCompany: any;
  locationForm: FormGroup;
  translation: Array<any> = [];
  @ViewChild('map') mapElement: ElementRef;
  map: any;

  constructor(public navParams: NavParams, private formBuilder: FormBuilder, public event: Events, public viewCtrl: ViewController,private translate: TranslateService){
    this.item = navParams.get('item');
    this.apiService = navParams.get('apiService');
    this.currentCompany = navParams.get('currentCompany');
    //this.translation = navParams.get('translation');
    this.translate.setDefaultLang('ua');

    this.locationForm = this.formBuilder.group({
      id: [''],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      lat: [null],
      lng: [null],
    });

    if(this.item){
      this.locationForm.patchValue(this.item);
    }
  }

  addLocation(){
    if(this.locationForm.value.id){
      this.apiService.put('locations/'+this.locationForm.value.id, this.locationForm.value).subscribe(
        data => {
          this.viewCtrl.dismiss(data);
        }
      );
    }else{
      this.apiService.post('locations', Object.assign(this.locationForm.value, {'company_id': this.currentCompany.id})).subscribe(
        data => {
          this.viewCtrl.dismiss(data);
        }
      );
    }
  }

  deleteLocation(){
      if(this.locationForm.value.id){
          this.apiService.delete('locations/'+this.locationForm.value.id).subscribe(
              data => {
                  //this.event.publish('location:delete', this.locationForm.value.id);
                  this.dismiss();
              }
          )
      }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad(){
    this.loadMap();
  }
  loadMap(){

    let geocoder = new google.maps.Geocoder();

    let latLng = new google.maps.LatLng(51.490454, 31.300784);
    if(this.item){
      latLng = new google.maps.LatLng(this.item.lat, this.item.lng);
    }

    let mapOptions = {
      center: latLng,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    let map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    let marker = new google.maps.Marker({
      position: latLng,
      map: map
    });

    map.addListener("click",(event) => {
      marker.setPosition(event.latLng);
      geocoder.geocode( { 'location': event.latLng}, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          this.locationForm.patchValue({address:results[0].formatted_address, lat: event.latLng.lat(), lng: event.latLng.lng()});
        } else {
          console.error("Geocode was not successful for the following reason: " + status);
        }
      });

    });
  }

}
