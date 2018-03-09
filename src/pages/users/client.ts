import { Component } from '@angular/core';
import {NavController, NavParams, Events} from 'ionic-angular';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ApiService} from "../../providers/api-service";

@Component({
  selector: 'page-client',
  templateUrl: 'client.html',
})
export class ClientPage {
  editUser: any;
  currentUser: any;
  userForm: FormGroup;
  companies: Array<any> = [];
  locations: Array<any> = [];
  statistic_client: any = [];

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

  constructor(public navCtrl: NavController, navParams: NavParams, private apiService: ApiService, private formBuilder: FormBuilder, public events: Events) {
    this.editUser = navParams.get('user');
    this.apiService.getUser().then(user => this.currentUser = user);

    this.userForm = this.formBuilder.group({
      id: [''],
      name: [''],
      email: [''],
      phone: [''],
      role: ['worker', Validators.required],
      company_id: [''],
      location_id: [''],
      password: [''],
    });

    let curr_year = new Date().getFullYear();
    let params = {
      keyword: '',
      company_id: 1,
      page: 1,
      type_order: 'day',
      statistics: true,
      range_start:curr_year+'-01-01',
      range_end:curr_year+'-12-31'
    };

      this.apiService.get('client/'+this.editUser.id, params).subscribe(
      data => {
        console.log('data load');
        this.statistic_client = data.statistics;
        if(this.editUser){
          this.userForm.patchValue(this.editUser);
        }else{
          this.userForm.patchValue({
            company_id: this.companies[0].id,
            location_id: this.locations.length ? this.locations[0].id : ''
          });
        }
      },  errMsg => false

    );

  }

  getChartData(statistics: any){
    statistics = this.statistic_client;

    let result: Array<any> = [];
    result.push(['Date', 'Payed', 'Not picked', 'Canceled', 'Active']);
    if(statistics){
      for(let stat in statistics){
        //console.log(stat, statistics[stat]);
        result.push([
          statistics[stat].order_date,
          parseInt(statistics[stat].payed),
          parseInt(statistics[stat].notpicked),
          parseInt(statistics[stat].canceled),
          parseInt(statistics[stat].active)
        ]);
      }
    }
    //console.log(result);
    return result;
  }


  saveUser(){
    if(this.userForm.value.id){
      this.apiService.put('users/'+this.editUser.id, this.userForm.value).subscribe(
        data => {
          if(data){
            this.events.publish('user:edit', data);
          }
          this.navCtrl.pop();
        }
      );
    }else{
      this.apiService.post('users', this.userForm.value).subscribe(
        data => {
          if(data){
            this.events.publish('user:created', data);
          }
          this.navCtrl.pop();
        }
      );
    }

  }

  removeUser(){
    if(this.editUser.id){
      this.apiService.delete('users/' + this.editUser.id).subscribe(
        data => {
          this.events.publish('user:delete', this.editUser);
          this.navCtrl.pop();
        }
      );
    }
    return false;
  }

  selectCompany(c){
    this.companies.forEach((item) => {
      if(item.id = c){
        this.locations = item.locations;
        return item;
      }
    });
    return this.locations = [];
  }

}
