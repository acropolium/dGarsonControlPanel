import { Component } from '@angular/core';
import { NavController, Events, NavParams } from 'ionic-angular';
import { ApiService } from '../../providers/api-service';
import { UserPage } from './user';
import { Observable } from 'rxjs';
import { ClientPage } from './client';

@Component({
    selector: 'page-users',
    templateUrl: 'users.html',
})
export class UsersPage {
    items: Array<any>;
    page: number = 1;
    keyword: string;
    infiniteScroll: any;
    currentUser: any;
    companyFilter = [];
    companies: Array<any> = [];
    selectedUser: any;
    user_type: any;

    constructor(
        public navCtrl: NavController,
        private apiService: ApiService,
        public events: Events,
        navParams: NavParams
    ) {
        this.user_type = navParams.data.user_type
            ? navParams.data.user_type
            : 'user';

        this.apiService
            .getUser()
            .then(user => {
                this.currentUser = user;
                return this.apiService.get('users/companies').toPromise();
            })
            .then(
                data => {
                    if (data && data.length) {
                        this.companies = data;
                    }
                    return this.getUsers().toPromise();
                },
                err => console.log(err)
            )
            .then(
                data => {
                    this.items = data.data;
                    this.page = data.current_page;
                },
                err => console.log(err)
            );

        events.subscribe('user:created', user => {
            this.items.unshift(user);
        });

        events.subscribe('user:edit', user => {
            if (user.id == this.selectedUser.id) {
                let index = this.items.indexOf(this.selectedUser, 0);
                if (index > -1) {
                    user.statistics = this.selectedUser.statistics;
                    this.items[index] = user;
                }
            }
        });

        events.subscribe('user:delete', user => {
            if (user.id == this.selectedUser.id) {
                let index = this.items.indexOf(this.selectedUser, 0);
                if (index > -1) {
                    this.items.splice(index, 1);
                }
            }
        });
    }

    orderClients(type) {
        this.page = 1;
        this.items = [];

        let params = {
            keyword: this.keyword,
            company_id: this.companyFilter,
            page: this.page,
            type_order: type,
        };

        this.apiService.get('clients', params).subscribe(
            data => {
                this.page = 1;
                this.items = data.data;
                if (this.infiniteScroll && data.data.length) {
                    this.infiniteScroll.enable(true);
                }
            },
            error => console.log(error)
        );
    }
    getStatisticValue(user, property) {
        let result = 0;
        return result;
        // user.statistics.forEach(data => {
        //   let value = data[property];
        //   if (value) {
        //     result = result + parseInt(value);
        //   }
        // });
        // return result;
    }

    getUsers(nextPage?: boolean): Observable<any> {
        let params = { keyword: this.keyword, company_id: this.companyFilter };
        if (nextPage) {
            params['page'] = this.page + 1;
        }
        var url = this.user_type == 'client' ? 'clients' : 'users';

        return this.apiService.get(url, params);
    }

    addUser() {
        this.navCtrl.push(UserPage, {
            user: null,
        });
    }

    /*ionViewWillEnter() {
    console.log('willenter',this.selectedUser);
    this.getUsers().subscribe(
      data => {
        this.items = data.data;
        this.page = data.current_page;
        if(this.infiniteScroll)
          this.infiniteScroll.enable(true);
      });
  }*/

    itemTapped(event, item) {
        this.selectedUser = item;
        let page = this.user_type == 'client' ? ClientPage : UserPage;
        this.navCtrl.push(page, {
            user: item,
        });
    }

    doInfinite(infiniteScroll) {
        this.infiniteScroll = infiniteScroll;
        this.getUsers(true).subscribe(data => {
            this.page = data.current_page;
            if (data.data.length) {
                this.items = this.items.concat(data.data);
            } else {
                infiniteScroll.enable(false);
            }
            infiniteScroll.complete();
        });
    }

    filterUsers(ev?: any) {
        if (ev) {
            this.keyword = ev.target.value || null;
        }
        this.getUsers().subscribe(
            data => {
                this.page = data.current_page;
                this.items = data.data;
                if (this.infiniteScroll && data.data.length) {
                    this.infiniteScroll.enable(true);
                }
            },
            error => console.log(error)
        );
    }
}
