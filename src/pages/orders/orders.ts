import {
    Component,
    trigger,
    state,
    style,
    transition,
    animate,
} from '@angular/core';
import { NavController, PopoverController, NavParams } from 'ionic-angular';
import { ApiService } from '../../providers/api-service';
import { Subscription } from 'rxjs';
import { SortPopover } from './sort-popover';
import { TranslateService } from 'ng2-translate';

@Component({
    selector: 'page-orders',
    templateUrl: 'orders.html',
    animations: [
        trigger('orderState', [
            state(
                'pending',
                style({
                    backgroundColor: '#fff',
                })
            ),
            transition('void => pending', [
                style({ 'background-color': '#f00' }),
                animate(5000),
            ]),
        ]),
    ],
})
export class OrdersPage {
    public items: Array<any> = [];
    companies: Array<any> = [];
    locations: Array<any> = [];
    user: any;
    companyFilter = [];
    locationFilter: any;
    page: number = 1;
    infiniteScroll: any;
    notificationSubscription: Subscription;
    loading: boolean = false;
    modifyTime: Date = new Date();
    order: string = 'created_at';
    showStates: string = 'all';

    constructor(
        public navCtrl: NavController,
        private apiService: ApiService,
        private popoverCtrl: PopoverController,
        public translate: TranslateService,
        public params: NavParams
    ) {
        //this.showStates = this.params.get('show');
    }

    ionViewDidLoad(): void {
        this.notificationSubscription = this.apiService.notificationRecieved$.subscribe(
            () => {
                this.getOrders(true).then(data => this.updateList(data.data));
            }
        );

        this.apiService
            .getUser()
            .then(user => {
                this.user = user;
                if (this.user.location_id) {
                    this.locationFilter = this.user.location_id;
                }
                return this.apiService.get('users/companies').toPromise();
            })
            .catch(err => console.log(err))
            .then(data => {
                if (data && data.length) {
                    this.companies = data;
                    this.companies.forEach(comp => {
                        this.companyFilter.push(comp.id);
                        this.locations = this.locations.concat(comp.locations);
                    });
                }
                return this.getOrders();
            })
            .then(data => {
                if (data) {
                    this.items = data.data;
                    this.page = data.current_page;
                }
            });
    }

    ionViewCanEnter(): boolean {
        return this.apiService.isAuth();
    }

    doRefresh(refresher) {
        this.getOrders(true).then(data => {
            this.updateList(data.data);
            refresher.complete();
        });
    }

    doInfinite(infiniteScroll) {
        this.infiniteScroll = infiniteScroll;
        this.getOrders(false, true).then(data => {
            this.page = data.current_page;
            if (data.data.length) {
                this.items = this.items.concat(data.data);
            } else {
                infiniteScroll.enable(false);
            }
            infiniteScroll.complete();
        });
    }

    setState(order, state) {
        order.loading = true;
        this.apiService
            .put('orders/' + order.id, { state: state })
            .subscribe(data => {
                let index = this.items.indexOf(order, 0);
                if (index > -1) {
                    if (data.state != 'cancel' && data.state != 'payed') {
                        data.showContent = true;
                    }
                    this.items[index] = data;
                }
                order.loading = false;
            }, error => (order.loading = true));
    }

    presentPopover(ev) {
        this.translate
            .get(['created_at', 'take_away_time'])
            .subscribe((translation: string) => {
                let popover = this.popoverCtrl.create(SortPopover, {
                    sorting: [
                        {
                            name: translation['created_at'],
                            value: 'created_at',
                        },
                        {
                            name: translation['take_away_time'],
                            value: 'take_away_time',
                        },
                    ],
                    selected: this.order,
                });

                popover.onDidDismiss(data => {
                    if (data) {
                        this.order = data;
                        this.filterOrders();
                    }
                });

                popover.present({
                    ev: ev,
                });
            });
    }

    getColor(state) {
        let colors = {
            inprogress: 'dark',
            ready: 'danger',
            cancel: 'light',
            notpicked: 'danger',
            payed: 'secondary',
        };

        return colors[state] ? colors[state] : 'primary';
    }

    filterOrders() {
        this.getOrders()
            .then(data => {
                this.page = data.current_page;
                this.items = data.data;
                if (this.infiniteScroll && data.data.length) {
                    this.infiniteScroll.enable(true);
                }
            })
            .catch(error => console.log(error));
    }

    trackByOrders(index: number, order: any) {
        return order.id;
    }

    getOrders(after?: boolean, nextPage?: boolean): Promise<any> {
        let params = {
            company_id: this.companyFilter,
            location_id: this.locationFilter,
            order: this.order,
            state: [],
        };
        let states = {
            new: ['pending', 'recieved'],
            process: ['inprogress', 'ready'],
        };
        if (states[this.showStates]) {
            params.state = states[this.showStates];
        }
        if (after && !nextPage) {
            params['after'] = this.modifyTime.toISOString();
        }
        if (nextPage) {
            params['page'] = this.page + 1;
        }
        this.modifyTime = new Date();
        return this.apiService.get('orders', params).toPromise();
    }

    updateList(newData: Array<any>) {
        if (newData.length) {
            if (this.items.length == 0) {
                this.items = newData;
                return true;
            }
            let temp = [];
            for (let j in newData) {
                for (let i in this.items) {
                    if (newData[j][this.order] > this.items[i][this.order]) {
                        temp.push(newData[j]);
                        break;
                    }
                    if (newData[j].id == this.items[i].id) {
                        this.items[i] = newData[j];
                        break;
                    }
                }
            }
            if (temp.length) {
                this.items = temp.concat(this.items);
            }
        }
    }

    changeLocation() {
        this.apiService.refreshDeviceToken(null, this.locationFilter);
        this.filterOrders();
    }

    ngOnDestroy() {
        // prevent memory leak when component destroyed
        this.notificationSubscription.unsubscribe();
    }
}

@Component({
    template: `<ion-tabs selectedIndex="0">
    <ion-tab tabIcon="list" [root]="tabAll" [rootParams]="{show: 'all'}" tabBadge="" tabBadgeStyle="danger"></ion-tab>
    <ion-tab tabIcon="cafe"  [root]="tabNew" [rootParams]="{show: 'new'}" tabBadge="14" tabBadgeStyle="danger"></ion-tab>
    <ion-tab tabIcon="construct" [root]="tabProcess" [rootParams]="{show: 'process'}"></ion-tab>
  </ion-tabs>`,
})
export class BadgesPage {
    tabAll = OrdersPage;
    tabNew = OrdersPage;
    tabProcess = OrdersPage;
    constructor() {}
}
