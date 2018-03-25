# Angular Busy Service

[![npm version](https://badge.fury.io/js/%40efk3%2Fangular-busy.svg)](https://badge.fury.io/js/%40efk3%2Fangular-busy)

Simple and customizable busy service for Angular applications. It handles global and custom element
block by a simple call, promise and observable.

## Installation

Install module:

`npm install @efk3/angular-busy`

Set up in your module:

```typescript
import { NgModule } from '@angular/core';
import { BusyModule, BUSY_DEFAULT_GLOBAL_COMPONENT, BUSY_DEFAULT_SPECIFIED_COMPONENT } from '@efk3/angular-busy';

@NgModule({
  imports: [BusyModule.forRoot()],
  declarations: [YourBlockerComponent, YourTargetSpecificBlockerComponent],
  entryComponents: [YourBlockerComponent, YourTargetSpecificBlockerComponent],
  providers: [
    { provide: BUSY_DEFAULT_GLOBAL_COMPONENT, useValue: YourBlockerComponent },
    { provide: BUSY_DEFAULT_SPECIFIED_COMPONENT, useValue: YourTargetSpecificBlockerComponent },
  ],
})
export class YourModule {}
```

## Configuration

The module is configurable by providers.

The component provided in `BUSY_DEFAULT_GLOBAL_COMPONENT` will be used when the target is not
specified for the block.

The component provided in `BUSY_DEFAULT_SPECIFIED_COMPONENT` will be used when the target is
specified in the block call. If you do not provide this then the `BUSY_DEFAULT_GLOBAL_COMPONENT`
will be used.

If there is no default component provided and the `busy` method called without `component` property
then the service will throw error.

## Usage

You can block the application or element manually, by promise and by observable.

If you call `busy()` multiple times then the component will be appended only once but the service
will store the number of blocks. The number of blocks is grouped by the target (if the target is not
specified then the `ApplicationRef` will be used). The appended component will be removed when the
block count is zero.

The `Target` type is an alias for `ApplicationRef`, `ViewContainerRef` and `ElementRef`.

### Manual block example

```typescript
import { BusyService } from '@efk3/angular-busy';

export class MyComponent {
  constructor(private busyService: BusyService) {
    this.busyService.busy();
    setTimeout(() => {
      this.busyService.done();
    }, 3000);
  }
}
```

### Block by an observable

The block will be initialized when the first subscription happens to the observable. The `busyObservable`
method will wrap the original observable so you have to use the returned observable to make the
service work. The block will be removed automatically when the observable completes or throws an error.

```typescript
import { BusyService } from '@efk3/angular-busy';

export class MyComponent {
  constructor(private busyService: BusyService, private http: HttpClient) {
    this.busyService.busyObservable({ observable: this.http.get('...') }).subscribe(() => {
      // logic
    });
  }
}
```

### Block by a promise

The block will be initialized instantly and will be removed when the promise returns or throws an error.

```typescript
import { BusyService } from '@efk3/angular-busy';

export class MyComponent {
  constructor(private busyService: BusyService) {
    const promise = new Promise<any>(() => {
      /* logic */
    });

    this.busyService.busyPromise({ promise });
    promise.then(() => {
      // logic
    });
  }
}
```

### Block input

Every block method accepts the following properties in the input object:

* `target` - The blocker component will be appended to the given target(s). Simple and multiple
  targets (as an array) are accepted.
* `data` - This object will be injected into the blocker component.
* `component` - You can specify the blocker component. If you do not set this property then the globally
  configured components will be used.

### Blocker component

You have to create your own blocker component. There is no requirement for this component but you
have to add it to the `entryComponents` too in your module because it will be created at runtime.

The blocker component will receive these custom injection:

* `@Inject(BUSY_DATA) public data: any` - this is the object which was set in the input object
  as `data`.
* `@Inject(BUSY_BLOCKER_COUNT) public blockerCount: Observable<number>` - this is the observable of
  the blocker count for the target.
* `@Inject(BUSY_TARGET) public target: Target` - this is the target of the blocker component.

### Get the blocker count

The `BusyService` provides two functions to check how many blockers exist on a target or on the
application.

* You can get the observable of the blocker count for a target with
  the `getBlockerCount(target: Target)` method.
* You can get the observable of the blocker count for the application
  with the `getGlobalBlockerCount()` method. This method is only a shortcut for
  `getBlockerCount(applicationRef)`

## Example

You can see a full example on [stackblitz][1].

[1]: https://stackblitz.com/edit/efk3-angular-busy-example
