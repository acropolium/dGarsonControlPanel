import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
    selector: 'page-company-filter',
    templateUrl: 'company-filter.html',
})
export class CompanyFilterPopover {
    companies: Array<any> = [];

    constructor(
        private navParams: NavParams,
        public viewCtrl: ViewController
    ) {}

    ngOnInit() {
        if (this.navParams.data) {
            this.navParams.data.apiService
                .get('companies')
                .subscribe(
                    data => (this.companies = data.data),
                    errMsg => errMsg
                );
        }
    }

    selectAll() {}

    selectNone() {}

    dismiss() {
        let data = { foo: 'bar' };
        this.viewCtrl.dismiss(data);
    }
}
