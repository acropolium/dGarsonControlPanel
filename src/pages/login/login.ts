import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { NavController, MenuController } from 'ionic-angular';
import 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import { ApiService } from '../../providers/api-service';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {
    login: FormGroup;
    user: any;

    constructor(
        public navCtrl: NavController,
        private formBuilder: FormBuilder,
        private apiService: ApiService,
        public menuCtrl: MenuController
    ) {
        //this.menuCtrl.enable(false);
        this.login = this.formBuilder.group({
            email: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    loginForm() {
        this.apiService.login(this.login.value);
    }
}
