import { BusyDirective } from './busy.directive';
import { BusyService } from './busy.service';
import { ElementRef, Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Component({
  template: ``,
})
class FakeComponent {}

@NgModule({
  declarations: [FakeComponent],
  entryComponents: [FakeComponent],
})
class TestModule {}

const elementRefMock = new ElementRef({
  appendChild: () => {},
});

describe(`BusyDirective`, () => {
  let directive;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [BusyService],
    });

    directive = new BusyDirective(TestBed.get(BusyService), elementRefMock);

    jest.clearAllMocks();
  });

  it('should accept observable as input', async () => {
    const spyBusy = jest.spyOn(BusyService.prototype, 'busy');
    const spyDone = jest.spyOn(BusyService.prototype, 'done');
    const subject = new Subject();

    directive.k3BusyComponent = FakeComponent;
    directive.k3Busy = subject.asObservable();

    expect(spyDone.mock.calls.length).toBe(0);
    expect(spyBusy.mock.calls.length).toBe(2);

    subject.complete();
    expect(spyDone.mock.calls.length).toBe(1);

    const subject2 = new Subject();
    directive.k3Busy = subject2.asObservable();
    try {
      subject2.error(null);
    } catch (ignore) {}
    expect(spyDone.mock.calls.length).toBe(2);
  });

  it('should accept promise as input', async () => {
    const spyBusy = jest.spyOn(BusyService.prototype, 'busy');
    const spyDone = jest.spyOn(BusyService.prototype, 'done');
    const promise = new Promise(resolve => {
      setTimeout(() => resolve(), 100);
    });

    directive.k3BusyComponent = FakeComponent;
    directive.k3Busy = promise;

    expect(spyDone.mock.calls.length).toBe(0);
    expect(spyBusy.mock.calls.length).toBe(2);

    await promise;
    expect(spyDone.mock.calls.length).toBe(1);
  });

  it('should accept null and undefined as input', async () => {
    expect(() => {
      directive.k3Busy = null;
    }).not.toThrow();

    expect(() => {
      directive.k3Busy = undefined;
    }).not.toThrow();
  });

  it('should handle input changes', async () => {
    const spyBusy = jest.spyOn(BusyService.prototype, 'busy');
    const spyDone = jest.spyOn(BusyService.prototype, 'done');
    const subject = new Subject();
    const subject2 = new Subject();
    const subject3 = new Subject();

    directive.k3BusyComponent = FakeComponent;

    directive.k3Busy = subject.asObservable();
    expect(spyDone.mock.calls.length).toBe(0);
    expect(spyBusy.mock.calls.length).toBe(2);

    directive.k3Busy = subject2.asObservable();
    expect(spyDone.mock.calls.length).toBe(0);
    expect(spyBusy.mock.calls.length).toBe(4);

    directive.k3Busy = subject3.asObservable();
    expect(spyDone.mock.calls.length).toBe(0);
    expect(spyBusy.mock.calls.length).toBe(6);

    subject.complete();
    expect(spyDone.mock.calls.length).toBe(1);
    subject2.complete();
    expect(spyDone.mock.calls.length).toBe(2);
    subject3.complete();
    expect(spyDone.mock.calls.length).toBe(3);
  });

  it('should throw exception when the input is not accepted', async () => {
    expect(() => {
      directive.k3Busy = {} as Observable<any>;
    }).toThrow();
  });
});
