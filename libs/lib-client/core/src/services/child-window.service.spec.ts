import { NgZone } from '@angular/core';
import { ChildWindowService } from './child-window.service';
import { WindowRef } from './window-ref';

describe('Service: ChildWindowService', function(this: {
  service: ChildWindowService;
  MockWindowClass: any;
  mockWindow: any;
  zone: NgZone;
  windowRef: WindowRef;
}) {
  beforeAll(() => {
    this.MockWindowClass = MockWindow;

    function MockWindow() {
      this.url = null;
      this.name = null;
      this.handler = null;

      this.open = (url, name) => {
        this.url = url;
        this.name = name;
        return new MockWindow();
      };

      this.on = (name: string, handler: Function) => {
        this.handler = handler;
      };

      this.off = () => {
        // noop
      };
    }
  });

  beforeEach(() => {
    this.mockWindow = new this.MockWindowClass();

    this.windowRef = { nativeWindow: <Window>this.mockWindow };
    this.zone = new NgZone({});
    this.service = new ChildWindowService(this.windowRef, this.zone);
  });

  it('Open should create a new child window', () => {
    const childWindow = this.service.open('an-url', 'a-name');
    expect(childWindow).toBeTruthy();
    expect(this.mockWindow.name).toEqual('a-name');
    expect(this.mockWindow.url).toEqual('an-url');
  });

  it('Child window should be marked as closed when the child window implementation closes', done => {
    const childMockWindow = new this.MockWindowClass();
    spyOn(this.mockWindow, 'open').and.returnValue(childMockWindow);

    const childWindow = this.service.open('an-url', 'a-name');
    expect(childWindow.isOpen()).toBe(true);
    childWindow.closed.subscribe(() => {
      expect(childWindow.isOpen()).toBe(false);
      done();
    });
    setTimeout(() => childMockWindow.handler(), 0);
  });
});
