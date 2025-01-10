import { bootstrapApplication } from '@angular/platform-browser';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Injectable,
  provideExperimentalZonelessChangeDetection,
  signal,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Injectable({ providedIn: 'root' })
class BlockService {
  currentBlock: string | null = null;
}

@Directive()
abstract class BaseBlockComponent {
  public renderCount = 0;
  private previousX = 0;
  private previousY = 0;
  protected abstract blockName: string;

  constructor(private blockService: BlockService) {}

  ngDoCheck() {
    if (this.blockService.currentBlock !== this.blockName) return;
    this.renderCount++;
  }

  onMouseDown(event: MouseEvent) {
    this.blockService.currentBlock = this.blockName;
    this.previousX = event.clientX;
    this.previousY = event.clientY;
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseUp = () => {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  private onMouseMove = (event: MouseEvent) => {
    const deltaX = event.clientX - this.previousX;
    const deltaY = event.clientY - this.previousY;
    this.setXandY(deltaX, deltaY);
    this.previousX = event.clientX;
    this.previousY = event.clientY;
  };

  abstract setXandY(deltaX: number, deltaY: number): void;
}

@Component({
  selector: 'rxjs-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="block"
      [style.left.px]="x | async"
      [style.top.px]="y | async"
      [style.background-color]="'#ed7f77'"
      (mousedown)="onMouseDown($event)"
    >
      <h1>RXJS</h1>
      <p>Checks: {{ renderCount }}</p>
    </div>
  `,
  imports: [AsyncPipe],
})
class RXJSBlockComponent extends BaseBlockComponent {
  public x = new BehaviorSubject<number>(20);
  public y = new BehaviorSubject<number>(20);
  protected blockName = 'rxjs-block';

  override setXandY(deltaX: number, deltaY: number): void {
    this.x.next(this.x.value + deltaX);
    this.y.next(this.y.value + deltaY);
  }
}

@Component({
  selector: 'signals-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="block"
      [style.left.px]="x()"
      [style.top.px]="y()"
      [style.background-color]="'#4287f5'"
      (mousedown)="onMouseDown($event)"
    >
      <h1>Signals</h1>
      <p>Checks: {{ renderCount }}</p>
    </div>
  `,
})
export class SignalsBlockComponent extends BaseBlockComponent {
  public x = signal<number>(190);
  public y = signal<number>(20);
  protected blockName = 'signals-block';

  override setXandY(deltaX: number, deltaY: number): void {
    this.x.update((x) => x + deltaX);
    this.y.update((y) => y + deltaY);
  }
}

@Component({
  selector: 'default-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="block"
      [style.left.px]="x"
      [style.top.px]="y"
      [style.background-color]="'#8294b0'"
      (mousedown)="onMouseDown($event)"
    >
      <h1>Default</h1>
      <p>Checks: {{ renderCount }}</p>
    </div>
  `,
})
export class DefaultBlockComponent extends BaseBlockComponent {
  public x = 360;
  public y = 20;
  protected blockName = 'default-block';

  override setXandY(deltaX: number, deltaY: number): void {
    this.x += deltaX;
    this.y += deltaY;
  }
}

@Component({
  selector: 'root',
  standalone: true,
  template: `
    <rxjs-block></rxjs-block>
    <signals-block></signals-block>
    <!-- <default-block></default-block> -->
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
  imports: [RXJSBlockComponent, SignalsBlockComponent, DefaultBlockComponent],
})
class AppComponent {}

bootstrapApplication(AppComponent, {
  providers: [provideExperimentalZonelessChangeDetection()],
}).catch((err) => console.error(err));
