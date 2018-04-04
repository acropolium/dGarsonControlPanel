import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../providers/api-service';

@Component({
    selector: 'page-user',
    templateUrl: 'user.html',
})
export class UserPage {
    editUser: any;
    currentUser: any;
    userForm: FormGroup;
    companies: Array<any> = [];
    locations: Array<any> = [];

    constructor(
        public navCtrl: NavController,
        navParams: NavParams,
        private apiService: ApiService,
        private formBuilder: FormBuilder,
        public events: Events
    ) {
        this.editUser = navParams.get('user');
        this.apiService.getUser().then(user => (this.currentUser = user));

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

        this.apiService
            .get('users/companies', { statistics: true })
            .subscribe(data => {
                this.companies = data;
                if (this.companies.length) {
                    if (this.companies[0].locations) {
                        this.locations = this.companies[0].locations;
                    }
                }
                if (this.editUser) {
                    this.userForm.patchValue(this.editUser);
                } else {
                    this.userForm.patchValue({
                        company_id: this.companies[0].id,
                        location_id: this.locations.length
                            ? this.locations[0].id
                            : '',
                    });
                }
            }, errMsg => false);
    }

    saveUser() {
        if (this.userForm.value.id) {
            this.apiService
                .put('users/' + this.editUser.id, this.userForm.value)
                .subscribe(data => {
                    if (data) {
                        this.events.publish('user:edit', data);
                    }
                    this.navCtrl.pop();
                });
        } else {
            this.apiService
                .post('users', this.userForm.value)
                .subscribe(data => {
                    if (data) {
                        this.events.publish('user:created', data);
                    }
                    this.navCtrl.pop();
                });
        }
    }

    removeUser() {
        if (this.editUser.id) {
            this.apiService
                .delete('users/' + this.editUser.id)
                .subscribe(data => {
                    this.events.publish('user:delete', this.editUser);
                    this.navCtrl.pop();
                });
        }
        return false;
    }

    selectCompany(c) {
        this.companies.forEach(item => {
            if (item.id == c) {
                this.locations = item.locations;
                return item;
            }
        });
        return (this.locations = []);
    }
}
