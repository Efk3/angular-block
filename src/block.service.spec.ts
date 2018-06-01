import { ApplicationRef, Component, Inject, NgModule, ViewContainerRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  BLOCK_BLOCKER_COUNT,
  BLOCK_DATA,
  BLOCK_DEFAULT_GLOBAL_COMPONENT,
  BLOCK_DEFAULT_SPECIFIED_COMPONENT,
  BLOCK_TARGET,
} from './block.provider';
import { BlockModule } from './block.module';
import { BlockService } from './block.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

describe(`BlockService`, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: BLOCK_DEFAULT_GLOBAL_COMPONENT, useValue: FakeComponent }],
      imports: [FakeModule, BlockModule.forRoot()],
    });
    document.body.innerHTML = '';
  });

  it('should use provided blocker components', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: BLOCK_DEFAULT_SPECIFIED_COMPONENT, useValue: FakeSpecifiedComponent }],
    });
    const service = TestBed.get(BlockService);
    service.block();
    expect(document.body.children[0].innerHTML).toBe('fake component content');

    const fixture = TestBed.createComponent(FakeContainerComponent);
    service.block({ target: fixture.componentInstance.viewContainerRef });
    expect(fixture.debugElement.nativeElement.children[0].innerHTML).toBe('fake specified component content');
  });

  it('should use global if there is no specified provided', () => {
    const service: BlockService = TestBed.get(BlockService);
    const fixture = TestBed.createComponent(FakeContainerComponent);
    service.block({ target: fixture.componentInstance.viewContainerRef });

    expect(fixture.debugElement.nativeElement.children[0].innerHTML).toBe('fake component content');
  });

  it('should throw error when no component provided', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [FakeModule, BlockModule.forRoot()],
    });
    const service: BlockService = TestBed.get(BlockService);

    expect(() => {
      service.block();
    }).toThrow();
  });

  it('should inject data, blocker count, target into component', () => {
    const service: BlockService = TestBed.get(BlockService);
    service.block({ data: { test: true } });
    const componentRef = service.getBlockerComponent();

    expect(componentRef).not.toBeNull();
    expect(componentRef.instance.data).not.toBeNull();
    expect(componentRef.instance.data.test).toBe(true);
    expect(componentRef.instance.blockerCount).toBeInstanceOf(Observable);
    componentRef.instance.blockerCount.subscribe(value => {
      expect(value).toBe(1);
    });
    expect(componentRef.instance.target).toBe(TestBed.get(ApplicationRef));
    expect(componentRef.instance.blockService).not.toBeUndefined();
  });

  it('should append blocker component only once', () => {
    const service: BlockService = TestBed.get(BlockService);
    service.block();
    service.block();
    service.block();

    expect(document.body.children.length).toBe(1);

    const fixture = TestBed.createComponent(FakeContainerComponent);
    service.block({ target: fixture.componentInstance.viewContainerRef });
    service.block({ target: fixture.componentInstance.viewContainerRef });
    service.block({ target: fixture.componentInstance.viewContainerRef });

    expect(fixture.debugElement.nativeElement.children.length).toBe(1);
  });

  it('should store the number of blocks', () => {
    const service: BlockService = TestBed.get(BlockService);
    service.block();
    service.block();
    service.block();

    service.getBlockerCount().subscribe(value => {
      expect(value).toBe(3);
    });

    const fixture = TestBed.createComponent(FakeContainerComponent);
    service.block({ target: fixture.componentInstance.viewContainerRef });
    service.block({ target: fixture.componentInstance.viewContainerRef });

    service.getBlockerCount(fixture.componentInstance.viewContainerRef).subscribe(value => {
      expect(value).toBe(2);
    });
  });

  it('should handle unblock when there is no active block', () => {
    const service: BlockService = TestBed.get(BlockService);
    service.unblock();

    const fixture = TestBed.createComponent(FakeContainerComponent);
    service.unblock(fixture.componentInstance.viewContainerRef);
  });

  it(
    'should remove the blocker component when the blocker count is zero',
    fakeAsync(() => {
      const service: BlockService = TestBed.get(BlockService);
      service.block();
      tick(1);
      service.block();
      expect(document.body.children.length).toBe(1);
      service.unblock();
      expect(document.body.children.length).toBe(1);
      service.unblock();
      expect(document.body.children.length).toBe(0);

      const fixture = TestBed.createComponent(FakeContainerComponent);
      service.block({ target: fixture.componentInstance.viewContainerRef });
      tick(1);
      service.block({ target: fixture.componentInstance.viewContainerRef });
      expect(fixture.debugElement.nativeElement.children.length).toBe(1);
      service.unblock(fixture.componentInstance.viewContainerRef);
      expect(fixture.debugElement.nativeElement.children.length).toBe(1);
      service.unblock(fixture.componentInstance.viewContainerRef);
      expect(fixture.debugElement.nativeElement.children.length).toBe(0);
    })
  );

  it(
    'should add block on subscription and remove after observable is finalized',
    fakeAsync(() => {
      const subject = new Subject();
      const service: BlockService = TestBed.get(BlockService);

      // complete
      const observable = service.block({ observable: subject.asObservable() });
      expect(document.body.children.length).toBe(0);
      observable.subscribe();
      tick();
      expect(document.body.children.length).toBe(1);
      subject.next();
      expect(document.body.children.length).toBe(1);
      subject.complete();
      expect(document.body.children.length).toBe(0);

      // error
      const subject2 = new Subject();
      const observable2 = service.block({ observable: subject2.asObservable() });
      const s = observable2.subscribe();
      tick();
      expect(document.body.children.length).toBe(1);

      try {
        subject2.error(null);
      } catch (ignore) {}

      expect(document.body.children.length).toBe(0);
      tick();
    })
  );

  it(
    'should work with subscription trigger',
    fakeAsync(() => {
      const service: BlockService = TestBed.get(BlockService);

      // complete
      const subject = new Subject();
      let subscription = subject.subscribe();
      service.block({ subscription });
      tick();
      expect(document.body.children.length).toBe(1);
      subject.next();
      expect(document.body.children.length).toBe(1);
      subject.complete();
      expect(document.body.children.length).toBe(0);

      // unsubscribe
      const subject2 = new Subject();
      subscription = subject2.subscribe();
      service.block({ subscription });
      tick();
      expect(document.body.children.length).toBe(1);
      subscription.unsubscribe();
      expect(document.body.children.length).toBe(0);
    })
  );

  it('should work with promise and remove block after promise resolves', async () => {
    const service: BlockService = TestBed.get(BlockService);

    // resolve
    const promise = new Promise(resolve => {
      setTimeout(() => {
        expect(document.body.children.length).toBe(1);
        resolve();
      }, 100);
    });

    await service.block({ promise });
    expect(document.body.children.length).toBe(0);

    // reject
    const promise2 = new Promise((resolve, reject) => {
      setTimeout(() => {
        expect(document.body.children.length).toBe(1);
        reject();
      }, 100);
    });
    try {
      await service.block({ promise: promise2 });
    } catch (ignore) {}
    expect(document.body.children.length).toBe(0);
  });

  it('should accept multiple target', async () => {
    const service: BlockService = TestBed.get(BlockService);
    const container1 = TestBed.createComponent(FakeContainerComponent);
    const container2 = TestBed.createComponent(FakeContainerComponent);

    service.block({ target: [container1.componentInstance.viewContainerRef, container2.componentInstance.viewContainerRef] });

    expect(container1.debugElement.nativeElement.children.length).toBe(1);
    expect(container2.debugElement.nativeElement.children.length).toBe(1);
  });

  it('should run callbacks when the block is removed', async () => {
    const service: BlockService = TestBed.get(BlockService);
    const subject = new Subject();
    let callbacks = 0;

    service.block({ observable: subject.asObservable(), callback: () => callbacks++ }).subscribe();
    service.block({ observable: subject.asObservable(), callback: () => callbacks++ }).subscribe();
    subject.complete();

    expect(callbacks).toBe(2);
  });

  it('should not remove observable when there is a subscription', async () => {
    const service: BlockService = TestBed.get(BlockService);
    let check = false;

    const subscription = service.getBlockerCount().subscribe(value => {
      if (check) {
        expect(value).toBe(1);
      }
    });

    service.block();
    service.unblock();
    expect(subscription.closed).toBeFalsy();

    check = true;
    service.block();
  });

  it('should be able to get blocker count', async () => {
    const service: BlockService = TestBed.get(BlockService);
    const container = TestBed.createComponent(FakeContainerComponent);
    const containerWithoutBlock = TestBed.createComponent(FakeContainerComponent);

    service.block();
    service.block();
    service.getBlockerCount().subscribe(value => expect(value).toBe(2));

    service.block({ target: container.componentInstance.viewContainerRef });
    service.getBlockerCount(container.componentInstance.viewContainerRef).subscribe(value => expect(value).toBe(1));
  });

  it('should be able to get blocker component', async () => {
    const service: BlockService = TestBed.get(BlockService);
    const container = TestBed.createComponent(FakeContainerComponent);
    const containerWithoutBlock = TestBed.createComponent(FakeContainerComponent);

    service.block();
    expect(service.getBlockerComponent()).not.toBeNull();

    service.block({ target: container.componentInstance.viewContainerRef });
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
    @Inject(BLOCK_DATA) public data: any,
    @Inject(BLOCK_BLOCKER_COUNT) public blockerCount: Observable<number>,
    @Inject(BLOCK_TARGET) public target: ViewContainerRef,
    public blockService: BlockService
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
