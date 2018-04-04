import { Injectable } from '@angular/core';
import {
    Http,
    Headers,
    Response,
    RequestOptions,
    URLSearchParams,
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { SERVER_URL, DEV_SERVER_URL } from './config';
import 'rxjs/add/operator/toPromise';
import 'rxjs/Rx';
import { Subject } from 'rxjs';
import { Platform, Config } from 'ionic-angular';

@Injectable()
export class ApiService {
    private headers = new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
    });
    private storage: Storage;
    private user: any;
    private loginSource = new Subject<any>();
    private unauthenticatedSource = new Subject<string>();
    private errorSource = new Subject<string>();
    public notificationSource = new Subject<any>();
    public deviceToken: string;
    private serverUrl: string = SERVER_URL;

    loggedin$ = this.loginSource.asObservable();
    unauthenticated$ = this.unauthenticatedSource.asObservable();
    errorHappened$ = this.errorSource.asObservable();
    notificationRecieved$ = this.notificationSource.asObservable();

    constructor(
        public http: Http,
        storage: Storage,
        public platform: Platform,
        public config: Config
    ) {
        if (this.config.get('DevUrl')) {
            this.serverUrl = DEV_SERVER_URL;
        }
        this.storage = storage;
        this.setHeaders();
    }

    private setHeaders() {
        //this.getUser().then();
        if (this.user) {
            this.headers.set('Authorization', 'Bearer ' + this.user.api_token);
        } else {
            this.storage.get('user').then(user => {
                if (user && user.api_token) {
                    this.user = user;
                    this.headers.set(
                        'Authorization',
                        'Bearer ' + this.user.api_token
                    );
                    this.loginSource.next(user);
                } else {
                    this.unauthenticatedSource.next();
                }
            });
        }
    }

    public get(url: string, params: any = {}) {
        let search = new URLSearchParams();
        Object.keys(params).map(function(value) {
            search.set(value, params[value]);
        });

        return this.http
            .get(this.serverUrl + url, {
                headers: this.headers,
                search: search,
            })
            .map(res => res.json())
            .catch(error => {
                return this.handleError(error);
            });
    }

    public post(url: string, data: any): Observable<any> {
        let options = new RequestOptions({ headers: this.headers });

        return this.http
            .post(this.serverUrl + url, data, options)
            .map(this.extractData)
            .catch(error => {
                return this.handleError(error);
            });
    }

    public put(url: string, data: any): Observable<any> {
        let options = new RequestOptions({ headers: this.headers });

        return this.http
            .put(this.serverUrl + url, data, options)
            .map(this.extractData)
            .catch(error => {
                return this.handleError(error);
            });
    }

    public delete(url: string): Observable<any> {
        return this.http
            .delete(this.serverUrl + url, { headers: this.headers })
            .map(res => res.json())
            .catch(error => {
                return this.handleError(error);
            });
    }

    public login(data: any) {
        return this.post('login', data).subscribe(
            user => {
                if (user.api_token) {
                    this.user = user;
                    this.setHeaders();
                    this.storage.set('user', user).then(user => {
                        this.loginSource.next(user);
                    });
                }
            },
            error => {
                let errMsg: string = '';
                console.log(error);
                if (error instanceof Response) {
                    const body = error.json() || '';
                    for (let value in body) {
                        errMsg += body[value].join(', ');
                    }
                    this.errorSource.next(errMsg);
                }
            }
        );
    }

    public logout(): Promise<any> {
        return this.storage.remove('user').then(() => {
            this.user = null;
            this.headers.delete('Authorization');
            this.unauthenticatedSource.next();
        });
    }

    public refreshDeviceToken(
        token: string,
        location_id?: number
    ): Promise<any> {
        if (token) {
            this.deviceToken = token;
        }
        if (this.isAuth()) {
            let platform = 'android';
            if (this.platform.is('ios')) {
                platform = 'ios';
            }
            if (location_id) {
                this.user.location_id = location_id;
                this.storage.set('user', this.user);
            }
            return this.put('users/refresh-token', {
                platform: platform,
                device_token: this.deviceToken,
                location_id: location_id,
            }).toPromise();
        }
    }

    public removeDeviceToken(): Promise<any> {
        if (this.deviceToken) {
            let platform = 'android';
            if (this.platform.is('ios')) {
                platform = 'ios';
            }
            return this.put('users/remove-token', {
                platform: platform,
                device_token: this.deviceToken,
            }).toPromise();
        } else {
            return new Promise((resolve, reject) => resolve(this.deviceToken));
        }
    }

    private extractData(res: Response) {
        let body = res.json();
        return body || {};
    }

    public handleError(error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string = '';
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);

            switch (error.status) {
                case 401:
                case 400:
                    for (let value in body) {
                        errMsg += body[value].join(', ');
                    }
                    break;

                default:
                    errMsg = `${error.status} - ${error.statusText ||
                        ''} ${err}`;
            }
        } else {
            try {
                const body = JSON.parse(error);
                for (let value in body) {
                    errMsg += body[value].join(', ');
                }
            } catch (e) {
                errMsg = error.toString();
            }
        }
        this.errorSource.next(errMsg);
        return Observable.empty();
    }

    isAuth(): boolean {
        return !!this.user;
    }

    getUser(): Promise<any> {
        if (this.user) {
            return new Promise((resolve, reject) => resolve(this.user));
        } else {
            return this.storage.get('user');
        }
    }

    public makeFileRequest(
        url: string,
        params: any,
        file?: File
    ): Observable<any> {
        return Observable.create(observer => {
            let formData: FormData = new FormData(),
                xhr: XMLHttpRequest = new XMLHttpRequest();

            Object.keys(params).map(function(value) {
                formData.append(value, params[value]);
            });

            if (file) {
                formData.append('logo', file, file.name);
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        observer.next(JSON.parse(xhr.response));
                        observer.complete();
                    } else {
                        observer.error(xhr.response);
                    }
                }
            };

            xhr.open('POST', this.serverUrl + url, true);
            xhr.setRequestHeader(
                'Authorization',
                'Bearer ' + this.user.api_token
            );
            xhr.send(formData);
        });
    }
}
