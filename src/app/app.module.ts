import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { CompaniesPage } from '../pages/companies/companies';
import { MenuPage } from '../pages/menu/menu';
import { UsersPage } from '../pages/users/users';
import { OrdersPage, BadgesPage } from '../pages/orders/orders';
import { UserPage } from '../pages/users/user';
import { ClientPage } from '../pages/users/client';
import { MenuItem } from '../pages/menu/menu-item';
import {
    TranslateModule,
    TranslateStaticLoader,
    TranslateLoader,
} from 'ng2-translate/ng2-translate';
import { Http } from '@angular/http';
import { SortPopover } from '../pages/orders/sort-popover';
import { MenuEdit } from '../pages/menu/menu-edit';
import { CompanyEdit } from '../pages/companies/company-edit';
import { LocationsPage } from '../pages/locations/locations';
import { LocationEdit } from '../pages/locations/location-edit';
import { GoogleChart } from '../directives/google-chart';
import { PopoverPage } from '../pages/popover/popover';
import { PopoverLocationsPage } from '../pages/popover/popover-locations';
import { PopoverMenuItem } from '../pages/popover/popover-menu-item';

export function createTranslateLoader(http: Http) {
    return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}

@NgModule({
    declarations: [
        MyApp,
        LoginPage,
        CompaniesPage,
        CompanyEdit,
        MenuPage,
        UsersPage,
        UserPage,
        ClientPage,
        OrdersPage,
        MenuEdit,
        MenuItem,
        SortPopover,
        BadgesPage,
        LocationsPage,
        LocationEdit,
        GoogleChart,
        PopoverPage,
        PopoverLocationsPage,
        PopoverMenuItem,
    ],
    imports: [
        IonicModule.forRoot(MyApp),
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [Http],
        }),
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        LoginPage,
        CompaniesPage,
        CompanyEdit,
        MenuPage,
        UsersPage,
        UserPage,
        ClientPage,
        OrdersPage,
        MenuEdit,
        MenuItem,
        SortPopover,
        BadgesPage,
        LocationsPage,
        LocationEdit,
        PopoverPage,
        PopoverLocationsPage,
        PopoverMenuItem,
    ],
    providers: [
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        Storage,
    ],
})
export class AppModule {}
