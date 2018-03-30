# Angular Busy Service

[![npm version](https://badge.fury.io/js/%40efk3%2Fangular-busy.svg)](https://badge.fury.io/js/%40efk3%2Fangular-busy)

Simple and customizable busy service for Angular applications. It handles global and custom element
block by a simple call, promise and observable.

## Installation

Install package:

`npm install @efk3/angular-busy`

Set up in your NgModule:

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

The component provided in `BUSY_DEFAULT_GLOBAL_COMPONENT` will be used as default blocker component
when the target is not specified.

The component provided in `BUSY_DEFAULT_SPECIFIED_COMPONENT` will be used as default blocker component
when the target is specified. If you do not provide this then the `BUSY_DEFAULT_GLOBAL_COMPONENT`
will be used.

If there is no default component provided and the `busy` method called without `component` property
then the service will throw error.

## Usage

You can block the application or element manually, by promise and by observable.

If you call `busy()` multiple times then the component will be appended only once but the service
will store the number of blocks. The number of blocks is grouped by the target (if the target is not
specified then the `ApplicationRef` will be used). The appended component will be removed when the
block count is zero.

### Manual block example

```typescript
import { BusyService } from '@efk3/angular-busy';

@Component({...})
export class MyComponent implements OnInit {
  constructor(private busyService: BusyService) {}

  public ngOnInit(): void {
    this.busyService.busy();

    setTimeout(() => {
      this.busyService.done();
    }, 3000);
  }
}
```

### Block by an observable example

The block will be initialized when the first subscription happens to the observable. The `busy`
method will wrap the original observable so you have to use the returned observable to make the
service work. The block will be removed automatically when the observable completes or throws an error.

```typescript
import { BusyService } from '@efk3/angular-busy';

@Component({...})
export class MyComponent implements OnInit {
  constructor(private busyService: BusyService, private http: HttpClient) {}

  public ngOnInit(): void {
    this.busyService.busy({ observable: this.http.get('...') }).subscribe(() => {
      // logic
    });
  }
}
```

### Block by a promise example

The block will be initialized instantly and will be removed when the promise returns or throws an error.

```typescript
import { BusyService } from '@efk3/angular-busy';

@Component({...})
export class MyComponent implements OnInit {
  constructor(private busyService: BusyService) {}

  public ngOnInit(): void {
    const promise = new Promise<any>(() => {
      // logic
    });

    this.busyService.busy({ promise });
    promise.then(() => {
      // logic
    });
  }
}
```

## Directive driven block

You can set up the block by a directive too.

```typescript
<div [k3Busy]="trigger" [k3BusyComponent]="BlockerComponent" [k3BusyData]="blockData">
</div>
```

The trigger can be an observable or a promise. The blocker component can be specified with the `k3BusyComponent` input. The data for blocker component can be specified with the `k3BusyData` input.

**Important** to know that the block will be triggered every time when the `k3Busy` input changes. If you want to replace e.g. an observable as a trigger then first you have to made the current observable complete or the block will not be removed.

### Block input

The block method accepts the following properties in the input object:

* `target` - The blocker component will be appended to the given target(s). Simple and multiple
  targets (as an array) are accepted. `ApplicationRef`, `ViewContainerRef` and `ElementRef` types are supported as target.
* `data` - This object will be injected into the blocker component.
* `component` - You can specify the blocker component. If you do not set this property then the globally
  configured components will be used.

### Blocker component

You have to create your own blocker component. There is no requirement for this component but you
have to add it to the `entryComponents` too in your module because it will be created at runtime.

The blocker component will receive the following custom injections.

#### Get content of the `data` property of input

```typescript
import { BUSY_DATA } from '@efk3/angular-busy'

@Inject(BUSY_DATA) public data: any
```

#### Get the number of blockers for target:

```typescript
import { BUSY_BLOCKER_COUNT } from '@efk3/angular-busy';

@Inject(BUSY_BLOCKER_COUNT) public blockerCount: Observable<number>
```

#### Get the target of block

```typescript
import { BUSY_TARGET } from '@efk3/angular-busy';

@Inject(BUSY_TARGET) public target: Target
```

### Observable blocker count

You can get the blocker count for a target with the

```typescript
getBlockerCount(target?: Target): Observable<number>
```

method. If the target is not specified then the `ApplicationRef` will be used as target.

## Example

You can see a full example on [stackblitz][1].

[1]: https://stackblitz.com/edit/efk3-angular-busy-example
