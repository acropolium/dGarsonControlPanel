import {Component} from '@angular/core';
import {NavController, ActionSheetController, ModalController} from 'ionic-angular';
import { ApiService } from '../../providers/api-service';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import {TranslateService} from "ng2-translate";
import {CompanyEdit} from "./company-edit";
import {LocationsPage} from "../locations/locations";
import {MenuPage} from "../menu/menu";

import {LocationEdit} from "../locations/location-edit";
import { PopoverController } from 'ionic-angular';
import { PopoverPage } from '../popover/popover';
import { PopoverLocationsPage } from '../popover/popover-locations';

@Component({
  selector: 'page-companies',
  templateUrl: 'companies.html',
})
export class CompaniesPage {
  items: any;
  companyForm: FormGroup;
  showForm: boolean = false;
  currentUser: any;
  range_start: any;
  range_end: any;
  formatdatetime: any = 'MM/DD/YYYY';
  group_statistic_by: any = 'day';
  isOutlineDay: boolean = true;
  isOutlineWeek: boolean = false;
  isOutlineMonth: boolean = false;
  showLocations: any = [];


  public chartOptions = {
    title: 'Orders',
    curveType: 'function',
    legend: { position: 'bottom'
    },
    isStacked: true,
    explorer: { maxZoomIn: .5 }
    //format: 'decimal'
    //hAxis: { ticks: [5,10,15,20] }
  };

	constructor(
	  public navCtrl: NavController,
      private apiService: ApiService,
      private formBuilder: FormBuilder,
      public translate: TranslateService,
      public actionSheetCtrl: ActionSheetController,
      public modalCtrl: ModalController,
      public popoverCtrl: PopoverController,
  ) {
      var today = new Date();
      var firstDayOfWeek = this.getMonday(today);
      var lastDayOfWeek = this.addDays(firstDayOfWeek, 6);

      this.range_start = firstDayOfWeek.toISOString();
      this.range_end = lastDayOfWeek.toISOString();

      //noinspection TypeScriptUnresolvedFunction
      this.apiService.getUser().then(user => this.currentUser = user);

      this.getCompaniesData({range_start: this.range_start, range_end: this.range_end, group_statistic_by: this.group_statistic_by});


      this.companyForm = this.formBuilder.group({
        id: [''],
        name: ['', Validators.required],
        address: ['', Validators.required],
        phone: ['', Validators.required],
      });

      this.translate.get([this.chartOptions.title]).subscribe(translation => this.chartOptions.title = translation[this.chartOptions.title]);
	}
  ionViewCanEnter():boolean {
      return this.apiService.isAuth();
  }

  saveFilteredLocationsId() {
    let newBanList = [];
    this.items.forEach(company => {
      company.locations.forEach(location => {
        if (location.isShowStatistic) {
          newBanList.push(location.id);
        }
      })
    });
    this.showLocations = newBanList;
  }

  getCompaniesData(range = {}) {
    var params = Object.assign({}, range, {statistics: true}) ;
    if(this.items) {
      this.saveFilteredLocationsId();
      params = Object.assign({}, params, {locations_allow: this.showLocations}) ;
    }

    let showLocations = this.showLocations;
    this.apiService.get('users/companies', params).subscribe(
        data => {
          data.forEach((item) => {
            item.locations.forEach((location) => {
              location.isShowStatistic = (showLocations.indexOf(location.id) !== -1  || !showLocations.length) ? true : false;
            })
          });
          this.items = data
        },
        errMsg => errMsg
    );
  }

  getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  changeTypeRange(show_range = ''){
    //var today = new Date();
    if (show_range == 'week') {

      /*var firstDayOfWeek = this.getMonday(today);
      var lastDayOfWeek = this.addDays(firstDayOfWeek, 6);

      firstDayOfWeek.setDate(firstDayOfWeek.getDate()-21);

      this.range_start = firstDayOfWeek.toISOString();
      this.range_end = lastDayOfWeek.toISOString();*/
      this.group_statistic_by = 'week';
      this.setActiveRange('week');
      this.getCompaniesData({range_start: this.range_start, range_end: this.range_end, group_statistic_by: this.group_statistic_by});
    } else if (show_range == 'month') {
      /*var firstDayOfMonth = new Date(today.getFullYear(), today.getMonth()-2, 1, 4);
      var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0, 4);

      this.range_start = firstDayOfMonth.toISOString();
      this.range_end = lastDayOfMonth.toISOString();*/
      this.group_statistic_by = 'month';
      this.setActiveRange('month');
      this.getCompaniesData({range_start: this.range_start, range_end: this.range_end, group_statistic_by: this.group_statistic_by});
    } else if (show_range == 'day') {

      this.group_statistic_by = 'day';
      this.setActiveRange('day');
      this.getCompaniesData({range_start: this.range_start, range_end: this.range_end, group_statistic_by: this.group_statistic_by});
    }
  }

  setActiveRange(type) {
    if (type == 'month') {
      this.isOutlineWeek = false;
      this.isOutlineMonth = true;
      this.isOutlineDay = false;
    } else if (type == 'day') {
      this.isOutlineWeek = false;
      this.isOutlineMonth = false;
      this.isOutlineDay = true;
    } else if (type == 'week') {
      this.isOutlineWeek = true;
      this.isOutlineMonth = false;
      this.isOutlineDay = false;
    }
  }

  setTimeRange(){
    this.getCompaniesData({range_start: this.range_start, range_end: this.range_end, group_statistic_by: this.group_statistic_by});
  }

  presentPopover(item, event) {
	  this.translate.get(['Menu', 'Edit']).subscribe((tranlation: string) => {
      let popover = this.popoverCtrl.create(PopoverPage, {company: item, ev: event, translation: tranlation});
      popover.onDidDismiss(data => {
        if (data && data.action && data.company) {
          if (data.action == 'edit') {
            this.presentEditModal(data.company);
          }
          if (data.action == 'menu') {
            this.navCtrl.push(MenuPage, {
              company: data.company,
              location: 0
            });
          }
        }
      });
      popover.present({ev: event});
    });
  }

  presentPopoverLocation(company, location, event) {
	  this.translate.get(['Edit', 'Delete', ])
    let popover = this.popoverCtrl.create(PopoverLocationsPage, {company: company, location: location , ev: event});
        popover.onDidDismiss(data => {
            if (data && data.action && data.company && data.location) {
                if (data.action == 'edit') {
                    this.presentLocationEditModal(data.company, data.location);
                    /*this.navCtrl.push(MenuPage, {
                        company: company,
                        location: location
                    });*/
                } else if(data.action == 'remove') {
                    if(confirm()){}
                }
            }
    });
      /*
      let posy = event.clientY
      let posx = 1500;
      let ev = {
          target : {
              getBoundingClientRect : () => {
                  return {
                      top: posy,
                      left: posx
                  };
              }
          }
      };*/
    popover.present({ev: event});
  }

  removeCompany(item){
    this.apiService.delete('companies/' + item.id).subscribe(
      data => {
        let index = this.items.indexOf(item, 0);
        if (data.hasOwnProperty('success') && index > -1) {
          this.items.splice(index, 1);
        }
      }
    );
  }

  presentCompanyActionSheet(item) {
    this.showForm = false;
    this.translate.get(['Choose action', 'Locations', 'Cancel', 'Edit', 'Delete']).subscribe((translation: string) => {
      let buttons = [
        {
          text: translation['Locations'],
          icon: 'pin',
          handler: () => {
            this.navCtrl.push(LocationsPage, {
              company: item
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
            this.removeCompany(item);
          }
        },
        {
          text: translation['Cancel'],
          role: 'cancel',
          icon: 'close'
        },
      ];
      if(!this.currentUser || this.currentUser.role != 'admin'){
        buttons.splice(2, 1);
      }
      let actionSheet = this.actionSheetCtrl.create({
        title: translation['Choose action'],
        buttons: buttons
      });
      actionSheet.present();
    });
  }

  presentLocationActionSheet(company, location) {
    this.translate.get(['Choose action', 'Menu', 'Cancel', 'Edit', 'Delete', 'delete_confirm']).subscribe((translation: string) => {
      let actionSheet = this.actionSheetCtrl.create({
        title: translation['Choose action'],
        buttons: [
          {
            text: translation['Menu'],
            icon: 'options',
            handler: () => {
              this.navCtrl.push(MenuPage, {
                company: company,
                location: location
              });
            }
          },
          {
            text: translation['Edit'],
            icon: 'create',
            handler: () => {
              this.presentLocationEditModal(company, location);
            }
          },
          {
            text: translation['Delete'],
            role: 'destructive',
            icon: 'trash',
            handler: () => {
              if(confirm(translation['delete_confirm'])){
                this.removeLocation(company, location);
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

  presentEditModal(item){
    this.translate.get(['Name', 'Address', 'Phone', 'Cancel', 'Save', 'Create', 'ukrainian', 'english', 'currency', 'Description']).subscribe((translation: string) => {

      let companyEditModal = this.modalCtrl.create(CompanyEdit, {item: item, apiService: this.apiService, translation: translation});

      companyEditModal.onDidDismiss(data => {
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
      companyEditModal.present()
    });
  }

  presentLocationEditModal(company, item){
    //this.translate.get(['Address', 'Phone', 'Cancel', 'Save', 'Create']).subscribe((translation: string) => {

    let menuEditModal = this.modalCtrl.create(LocationEdit, {item: item, currentCompany: company, apiService: this.apiService/*, translation: translation*/});

    menuEditModal.onDidDismiss(data => {

      if(data) {
        this.items.forEach((val, i) => {
          if (val.id == data.company_id) {
            let newitem = null;
            let index = null;
            this.items[i].locations.forEach(function(el, indx){
                if (el.id == data.id) {
                    newitem = data;
                    index = indx;
                }
            });
            if (index) {
              this.items[i].locations[index] = newitem;
            } else {
              this.items[i].locations.push(data);
            }
          }
        });
      }
    });
    menuEditModal.present();
  }

  removeLocation(company, location){
    this.apiService.delete('locations/' + location.id).subscribe(
      data => {
        let cIndex = this.items.indexOf(company, 0);
        if (data.hasOwnProperty('success') && cIndex > -1) {
          let index = this.items[cIndex].locations.indexOf(location, 0);
          if (index > -1) {
            this.items[cIndex].locations.splice(index, 1);
          }
        }
      }
    );
  }

  getChartData(statistics: any){
    let result: Array<any> = [];
    result.push(['Date', 'Payed', 'Not picked', 'Canceled', 'Active']);
    if(statistics){
      for(let stat in statistics){
        //console.log(stat, statistics[stat]);
        result.push([
          statistics[stat].legend,
          parseInt(statistics[stat].payed),
          parseInt(statistics[stat].notpicked),
          parseInt(statistics[stat].canceled),
          parseInt(statistics[stat].active)
        ]);
      }
    }

    //console.log('getChartData', result);
    return result;
  }

}
