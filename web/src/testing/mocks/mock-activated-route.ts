// source: https://semaphoreci.com/community/tutorials/testing-routes-in-angular-2

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class MockActivatedRoute {
    private paramsSubject = new BehaviorSubject(this.testParams);
    private _testParams: {};

    get params() {
      return this.paramsSubject.asObservable();
    }

    get testParams() {
        return this._testParams;
    }
    set testParams(newParams: any) {
        this._testParams = newParams;
        this.paramsSubject.next(newParams);
    }
}
