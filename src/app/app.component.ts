import { Component, ViewChild } from '@angular/core';
import {Nav, Platform, ToastController, MenuController, AlertController} from 'ionic-angular';
import { Splashscreen, Push, MediaPlugin } from 'ionic-native';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../pages/login/login';
import { CompaniesPage } from '../pages/companies/companies';
import { UsersPage } from '../pages/users/users';
import { OrdersPage } from '../pages/orders/orders';
import { ApiService } from '../providers/api-service';
import { Subscription } from "rxjs";
import firebase from 'firebase';
import { firebaseConfig } from "../providers/config";
import { TranslateService } from 'ng2-translate/ng2-translate';
import { MenuPage } from "../pages/menu/menu";

@Component({
  templateUrl: 'app.html',
  providers: [Storage, ApiService, TranslateService]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  user: any;
  rootPage: any = OrdersPage;
  loginSubscription: Subscription;
  unAuthSubscription: Subscription;
  errorSubscription: Subscription;

  pages: Array<{title: string, component: any, params: any}>;

  private _messaging: firebase.messaging.Messaging;
  file: MediaPlugin;

  constructor(
    public platform: Platform,
    public menuCtrl: MenuController,
    private apiService: ApiService,
    public toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public translate: TranslateService
  ) {


    // -- DEFINE DEFAULT LANGUAGE --
    this.translate.setDefaultLang('ua');
    //this.translate.use('ua');
    this.initializeApp();

    this.pages = [
      { title: 'Orders', component: OrdersPage, params: {} },
      { title: 'Menu', component: MenuPage, params: {} },
      { title: 'Clients', component: UsersPage, params: {user_type: 'client'} },
      { title: 'Companies', component: CompaniesPage, params: {} },
      { title: 'Users', component: UsersPage, params: {user_type: false} }
    ];

  }

  listenRing(ev, init=true) {
    this.file.play();
    if (init) {
      //this.file.pause();
      this.file.stop();
    }
  }

  initializeApp() {

    this.platform.ready().then(() => {
      this.loginSubscription = this.apiService.loggedin$.subscribe((user) => {
        this.menuCtrl.enable(true);
        this.user = user;
        if (user.role == 'admin') {
          this.pages.splice(1,1); // remove menu
          this.rootPage = CompaniesPage;
        }

        this.nav.setRoot(this.rootPage);
        this.initWebPush();
      });

      this.unAuthSubscription = this.apiService.unauthenticated$.subscribe(() => {
        this.menuCtrl.enable(false);
        this.openPage({ title: 'Login', component: LoginPage });
      });

      this.errorSubscription = this.apiService.errorHappened$.subscribe(error => {
        this.presentToast(error);
      });

      firebase.initializeApp(firebaseConfig);

      Splashscreen.hide();
      this.file = new MediaPlugin('assets/the-calling.mp3');
    });
  }

  initWebPush() {
    if(this.platform.is('mobileweb') || this.platform.is('mobile') || this.platform.is('core')){

      this._messaging = firebase.messaging();
      this._messaging.requestPermission()
        .then(() => {
          console.log('Notification permission granted.');
          return this._messaging.getToken();
        })
        .then((currentToken) => {
          if (currentToken) {
            this.apiService.refreshDeviceToken(currentToken);
          } else {
            console.log('No Instance ID token available. Request permission to generate one.');
          }
        })
        .catch((err) => {
          console.log('Unable to get permission to notify.', err);
        });

      this._messaging.onMessage(payload => {console.log("Notification", payload); this.onPushNotification(payload.data)});
      this._messaging.onTokenRefresh((newToken) => {
        if (newToken) {
          this.apiService.refreshDeviceToken(newToken);
        }
      });
    }else{
      let push = Push.init({
        android: {
          senderID: "89724956783"
        },
        ios: {
          alert: "true",
          badge: true,
          sound: 'false'
        },
        windows: {}
      });

      push.on('registration', (data) => {
        if(data.registrationId){
          this.apiService.refreshDeviceToken(data.registrationId);
        }
      });

      push.on('notification', (data) => this.onPushNotification(data.additionalData));

      push.on('error', (e) => {
        console.log(e);
      });
    }
  }

  public openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if (page.title == 'Menu') {
      return this.apiService.get('users/companies').subscribe((data) => {
        let company = data[0];
        if (company) {
          this.nav.setRoot(page.component, {company: company});
          //return this.nav.push(MenuPage, {company: company});
        }
      });
    }
    var navparams = (page.params && page.params.user_type) ? page.params : {};
    this.nav.push(page.component, navparams);
  }

  public logout(): void {

    this.apiService.removeDeviceToken()
      .then(() => {
        return this.apiService.logout()
      })
      .catch((err) => {
        console.log('error', err);
        this.apiService.logout();
    });

  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000
    });
    toast.present();
  }

  /*presentConfirm(order) {
    this.translate.get(['New Order', 'new order message', 'No', 'Yes']).subscribe((translation: string) => {
      let alert = this.alertCtrl.create({
        title: translation['New Order'] + ' #' + order.id,
        message: translation['new order message'],
        buttons: [
          {
            text: translation['No'],
            role: 'cancel'
          },
          {
            text: translation['Yes'],
            handler: () => {
              this.nav.setRoot(OrdersPage);
            }
          }
        ]
      });
      alert.present();
    });

  }*/

  onPushNotification(payload){
    // this.file.play();
    this.listenRing(null, false);
    this.apiService.notificationSource.next(payload);
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.loginSubscription.unsubscribe();
    this.unAuthSubscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }
}
