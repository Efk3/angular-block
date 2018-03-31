import { ApplicationRef, Component, ElementRef, Inject, NgModule, ViewChild, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BUSY_BLOCKER_COUNT,
  BUSY_DATA,
  BUSY_DEFAULT_GLOBAL_COMPONENT,
  BUSY_DEFAULT_SPECIFIED_COMPONENT,
  BUSY_TARGET,
} from './busy.provider';
import { BusyModule } from './busy.module';
import { BusyService } from './busy.service';
import { DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

describe(`BusyService`, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: BUSY_DEFAULT_GLOBAL_COMPONENT, useValue: FakeComponent }],
      imports: [FakeModule, BusyModule.forRoot()],
    });
  });

  it('should use provided blocker components', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: BUSY_DEFAULT_SPECIFIED_COMPONENT, useValue: FakeSpecifiedComponent }],
    });
    const service = TestBed.get(BusyService);
    service.busy();
    expect(document.body.children[0].innerHTML).toBe('fake component content');

    const fixture = TestBed.createComponent(FakeContainerComponent);
    service.busy({ target: fixture.componentInstance.viewContainerRef });
    expect(fixture.debugElement.nativeElement.children[0].innerHTML).toBe('fake specified component content');
  });

  it('should use global if there is no specified provided', () => {
    const service: BusyService = TestBed.get(BusyService);
    const fixture = TestBed.createComponent(FakeContainerComponent);
    service.busy({ target: fixture.componentInstance.viewContainerRef });

    expect(fixture.debugElement.nativeElement.children[0].innerHTML).toBe('fake component content');
  });

  it('should throw error when no component provided', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [FakeModule, BusyModule.forRoot()],
    });
    const service: BusyService = TestBed.get(BusyService);

    expect(() => {
      service.busy();
    }).toThrow();
  });

  it('should inject data, blocker count, target into component', () => {
    const service: BusyService = TestBed.get(BusyService);
    service.busy({ data: { test: true } });
    const componentRef = service.getBlockerComponent();

    expect(componentRef).not.toBeNull();
    expect(componentRef.instance.data).not.toBeNull();
    expect(componentRef.instance.data.test).toBe(true);
    expect(componentRef.instance.blockerCount).toBeInstanceOf(Observable);
    componentRef.instance.blockerCount.subscribe(value => {
      expect(value).toBe(1);
    });
    expect(componentRef.instance.target).toBe(TestBed.get(ApplicationRef));
    expect(componentRef.instance.busyService).not.toBeUndefined();
  });

  it('should append blocker component only once', () => {
    const service: BusyService = TestBed.get(BusyService);
    service.busy();
    service.busy();
    service.busy();

    expect(document.body.children.length).toBe(1);

    const fixture = TestBed.createComponent(FakeContainerComponent);
    service.busy({ target: fixture.componentInstance.viewContainerRef });
    service.busy({ target: fixture.componentInstance.viewContainerRef });
    service.busy({ target: fixture.componentInstance.viewContainerRef });

    expect(fixture.debugElement.nativeElement.children.length).toBe(1);
  });

  it('should store the number of blocks', () => {
    const service: BusyService = TestBed.get(BusyService);
    service.busy();
    service.busy();
    service.busy();

    service.getBlockerCount().subscribe(value => {
      expect(value).toBe(3);
    });

    const fixture = TestBed.createComponent(FakeContainerComponent);
    service.busy({ target: fixture.componentInstance.viewContainerRef });
    service.busy({ target: fixture.componentInstance.viewContainerRef });

    service.getBlockerCount(fixture.componentInstance.viewContainerRef).subscribe(value => {
      expect(value).toBe(2);
    });
  });

  it('should remove the blocker component when the blocker count is zero', () => {
    const service: BusyService = TestBed.get(BusyService);
    service.busy();
    service.busy();
    expect(document.body.children.length).toBe(1);
    service.done();
    expect(document.body.children.length).toBe(1);
    service.done();
    expect(document.body.children.length).toBe(0);

    const fixture = TestBed.createComponent(FakeContainerComponent);
    service.busy({ target: fixture.componentInstance.viewContainerRef });
    service.busy({ target: fixture.componentInstance.viewContainerRef });
    expect(fixture.debugElement.nativeElement.children.length).toBe(1);
    service.done(fixture.componentInstance.viewContainerRef);
    expect(fixture.debugElement.nativeElement.children.length).toBe(1);
    service.done(fixture.componentInstance.viewContainerRef);
    expect(fixture.debugElement.nativeElement.children.length).toBe(0);
  });

  it('should add block on subscription and remove after observable is finalized', () => {
    const subject = new Subject();
    const service: BusyService = TestBed.get(BusyService);

    // complete
    const observable = service.busy({ observable: subject.asObservable() });
    expect(document.body.children.length).toBe(0);
    observable.subscribe();
    expect(document.body.children.length).toBe(1);
    subject.next();
    expect(document.body.children.length).toBe(1);
    subject.complete();
    expect(document.body.children.length).toBe(0);

    // error
    const subject2 = new Subject();
    const observable2 = service.busy({ observable: subject2.asObservable() });
    observable2.subscribe();
    expect(document.body.children.length).toBe(1);

    try {
      subject2.error(null);
    } catch (ignore) {}

    expect(document.body.children.length).toBe(0);
  });

  it('should work with promise and remove block after promise resolves', async () => {
    const service: BusyService = TestBed.get(BusyService);

    // resolve
    const promise = new Promise(resolve => {
      setTimeout(() => {
        expect(document.body.children.length).toBe(1);
        resolve();
      }, 100);
    });

    await service.busy({ promise });
    expect(document.body.children.length).toBe(0);

    // reject
    const promise2 = new Promise((resolve, reject) => {
      setTimeout(() => {
        expect(document.body.children.length).toBe(1);
        reject();
      }, 100);
    });
    try {
      await service.busy({ promise: promise2 });
    } catch (ignore) {}
    expect(document.body.children.length).toBe(0);
  });

  it('should accept multiple target', async () => {
    const service: BusyService = TestBed.get(BusyService);
    const container1 = TestBed.createComponent(FakeContainerComponent);
    const container2 = TestBed.createComponent(FakeContainerComponent);

    service.busy({ target: [container1.componentInstance.viewContainerRef, container2.componentInstance.viewContainerRef] });

    expect(container1.debugElement.nativeElement.children.length).toBe(1);
    expect(container2.debugElement.nativeElement.children.length).toBe(1);
  });

  it('should run callbacks when the block is removed', async () => {
    const service: BusyService = TestBed.get(BusyService);
    const subject = new Subject();
    let callbacks = 0;

    service.busy({ observable: subject.asObservable(), callback: () => callbacks++ }).subscribe();
    service.busy({ observable: subject.asObservable(), callback: () => callbacks++ }).subscribe();
    subject.complete();

    expect(callbacks).toBe(2);
  });

  it('should not remove observable when there is a subscription', async () => {
    const service: BusyService = TestBed.get(BusyService);
    let check = false;

    const subscription = service.getBlockerCount().subscribe(value => {
      if (check) {
        expect(value).toBe(1);
      }
    });

    service.busy();
    service.done();
    expect(subscription.closed).toBeFalsy();

    check = true;
    service.busy();
  });

  it('should be able to get blocker count', async () => {
    const service: BusyService = TestBed.get(BusyService);
    const container = TestBed.createComponent(FakeContainerComponent);
    const containerWithoutBlock = TestBed.createComponent(FakeContainerComponent);

    service.busy();
    service.busy();
    service.getBlockerCount().subscribe(value => expect(value).toBe(2));

    service.busy({ target: container.componentInstance.viewContainerRef });
    service.getBlockerCount(container.componentInstance.viewContainerRef).subscribe(value => expect(value).toBe(1));
  });

  it('should be able to get blocker component', async () => {
    const service: BusyService = TestBed.get(BusyService);
    const container = TestBed.createComponent(FakeContainerComponent);
    const containerWithoutBlock = TestBed.createComponent(FakeContainerComponent);

    service.busy();
    expect(service.getBlockerComponent()).not.toBeNull();

    service.busy({ target: container.componentInstance.viewContainerRef });
    expect(service.getBlockerComponent(container.componentInstance.viewContainerRef)).not.toBeNull();

    expect(service.getBlockerComponent(containerWithoutBlock.componentInstance.viewContainerRef)).toBeNull();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });
});

@Component({
  template: `fake component content`,
})
class FakeComponent {
  constructor(
    @Inject(BUSY_DATA) public data: any,
    @Inject(BUSY_BLOCKER_COUNT) public blockerCount: Observable<number>,
    @Inject(BUSY_TARGET) public target: ViewContainerRef,
    public busyService: BusyService
  ) {}
}

@Component({
  template: `fake specified component content`,
})
class FakeSpecifiedComponent {}

@Component({
  template: ``,
})
class FakeContainerComponent {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

@NgModule({
  declarations: [FakeContainerComponent, FakeComponent, FakeSpecifiedComponent],
  entryComponents: [FakeComponent, FakeSpecifiedComponent],
})
class FakeModule {}
