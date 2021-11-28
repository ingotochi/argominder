import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ChangeDetectorAuth } from '../components/detectors/auth.service';
import { authActions } from '../enums/enums';

@Component({
  template: ''
})

  export abstract class BaseComponentDetail<T> {
    public token: string;
    private auth$: Subscription;
    public datasource: T;
  
    constructor(public auth: ChangeDetectorAuth) {
       this.auth$ = this.auth.getDataChanges().pipe(filter(tt => tt.action === authActions.token)).subscribe(result => {
        this.token = result.payload.access_token;
      })
      this.datasource = {} as T;
    }

    ngOnInit() {

    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
      this.auth$.unsubscribe();
    }


    abstract loadPreview(target?: HTMLElement): void;

    abstract startStream(): void;

    abstract stopStream(): void;

  }