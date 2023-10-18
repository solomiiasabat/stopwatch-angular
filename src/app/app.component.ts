/**
 * AppComponent: A stopwatch component that offers basic timekeeping functionality
 * along with a custom double-click "Wait" mechanism.
 */
import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable, Subject, interval } from 'rxjs';
import { takeWhile, debounceTime, buffer, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title: string = 'stopwatch';

  /** An observable that emits values at regular intervals, representing each second that passes. */
  stream$!: Observable<number>;

  /** A flag indicating whether the stopwatch is currently running. */
  isRunning: boolean = false;

  /** The total elapsed time in seconds since the stopwatch started. */
  elapsedSeconds: number = 0;

  /** The formatted elapsed time, displayed in the format "HH:mm:ss". */
  time: string = '00:00:00';

  /** A subject that emits a value every time the "Wait" button is clicked. */
  private waitClickSubject: Subject<void> = new Subject<void>();

  /** An observable derived from waitClickSubject to track the "Wait" button clicks. */
  private clickStream$: Observable<void> = this.waitClickSubject.asObservable();

  /**
   * Constructor: Sets up the stopwatch component and initializes click handling logic.
   * @param datePipe - An Angular pipe used for date formatting.
   */
  constructor(private datePipe: DatePipe) {
    this.handleWaitClicks();
  }

  /** Toggles the running state of the stopwatch.
   * If starting, it initializes an interval observable to count each second. */
  toggle(): void {
    this.isRunning = !this.isRunning;

    if (this.isRunning) {
      this.stream$ = interval(1000).pipe(takeWhile(() => this.isRunning));

      this.stream$.subscribe(() => {
        this.elapsedSeconds += 1;
        this.time =
          this.datePipe.transform(
            this.elapsedSeconds * 1000,
            'HH:mm:ss',
            'UTC'
          ) || '00:00:00';
      });
    }
  }

  /** Emits a value indicating the "Wait" button was clicked. */
  waitClick(): void {
    this.waitClickSubject.next();
  }

  /** Resets the stopwatch, clearing the elapsed time. */
  reset(): void {
    this.isRunning = false;
    this.elapsedSeconds = 0;
    this.time = '00:00:00';
  }

  /** Sets up the logic to handle double-clicks on the "Wait" button within a 300ms window. */
  private handleWaitClicks(): void {
    this.clickStream$
      .pipe(
        buffer(this.clickStream$.pipe(debounceTime(300))),
        filter((clicks) => clicks.length >= 2)
      )
      .subscribe(() => {
        this.toggleWaitState();
      });
  }

  /** Pauses the stopwatch when the "Wait" button is double-clicked. */
  private toggleWaitState(): void {
    this.isRunning = false;
  }
}
