import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit
} from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { ChangeDetectorConfigurations } from './components/detectors/configurations.service';
import { IConf } from './interfaces/IConf';
import { IConfigurationsList } from './interfaces/IConfigurationsList';
import { IEventsFilter } from './interfaces/IEventsFilter';
import { ILogin } from './interfaces/ILogin';
import { IStreamProperties } from './interfaces/IStreamProperties';
import { zmService } from './services/zm.service';

@Component({
  selector: 'argominder',
  templateUrl: './argominder.component.html',
  styleUrls: ['./argominder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArgoMinderComponent implements OnInit, AfterViewInit {
  login: ILogin = (<ILogin>{ login: {} });
  userIsLogged: boolean = false;
  errorLogin: string = '';
  zmUsername: string = '';
  zmPassword: string = '';
  localToken: string = '';
  selectedTab: number;
  loadStream: boolean;
  private configurationsList: IConfigurationsList = {
    camDiapason: [], eventsFilter: {} as IEventsFilter, previewStatus: false, streamingConfChanges: [], streamingProperties: {} as IStreamProperties
  };
  
  constructor(private zmService: zmService, private changeRef: ChangeDetectorRef, private configurations: ChangeDetectorConfigurations) {
    this.configurations.initializeDataChanges();
    this.configurations.setAll(this.configurationsList);
    if(this.retrieveSession() === true) {
      this.selectedTab = 0;
      this.userIsLogged = true;
      this.logInZm(true);
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  logInZm(isRetrieved: boolean) {
    return this.zmService.getConfigurationFile().pipe(
      switchMap((conf: IConf) => {
        this.zmService.configurationFileMapping(conf);
        return this.zmService.zmLogin(this.zmUsername, this.zmPassword);
      })
    ).subscribe((login: ILogin) => {
      this.login = login;
      if (!isRetrieved) {
        this.userIsLogged = this.login.access_token.length > 0 ? true : false;
        this.saveSession();
        this.localToken = localStorage.getItem("accessToken");
        this.selectedTab = 0;
      }
      this.loadStream = login.access_token.length > 0 ? true : false;
      this.changeRef.markForCheck();
    }, (err: Error) => {
      this.errorLogin = err.message;
    });
  }

  retrieveSession() {
    this.localToken = localStorage.getItem("accessToken") ? this.localToken = localStorage.getItem("accessToken") : this.localToken;
    //Rivedere, non salvare Username e Passwd
    this.zmUsername = localStorage.getItem("username") ? this.zmUsername = localStorage.getItem("username") : this.zmUsername;
    this.zmPassword = localStorage.getItem("password") ? this.zmPassword = localStorage.getItem("password") : this.zmPassword; 
    if (this.localToken.length > 0 && this.zmUsername.length > 0 && this.zmPassword.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  saveSession() {
    localStorage.setItem("accessToken", this.login.access_token);
    localStorage.setItem("username", this.zmUsername);
    localStorage.setItem("password", this.zmPassword);
  }

  destroySession() {
    localStorage.setItem("accessToken", '');
    localStorage.setItem("username", '');
    localStorage.setItem("password", '');
    this.errorLogin = '';
  }

  logOutZm() {
    this.userIsLogged = false;
    this.destroySession();
    location.reload();
  }

}