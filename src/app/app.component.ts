/**
 * AppComponent: A stopwatch component that provides basic time tracking and control functionalities.
 */
import { Component, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { interval, Subject } from 'rxjs';
import { debounceTime, buffer, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  /** Indicates the running state of the stopwatch. */
  isRunning = false;

  /** Represents the total elapsed time in seconds since the stopwatch started. */
  elapsedSeconds = 0;

  /** Displays the elapsed time in the "HH:mm:ss" format. */
  time = '00:00:00';

  /** Subject to handle the unsubscription from observables. */
  private unsubscribe$ = new Subject<void>();

  /** Subject to handle the "Wait" button clicks. */
  private waitClick$ = new Subject<void>();

  /**
   * Sets up the stopwatch component and initializes wait handling logic.
   * @param datePipe - Used for transforming elapsed seconds into a readable time format.
   */
  constructor(private datePipe: DatePipe) {
    this.setupWaitHandler();
  }

  /**
   * Completes the unsubscription subject to perform cleanup.
   */
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Toggles the running state of the stopwatch. Starts or stops the time tracking.
   */
  toggle(): void {
    if (this.isRunning) {
      this.isRunning = false;
      this.unsubscribe$.next();
    } else {
      this.isRunning = true;
      interval(1000)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
          this.elapsedSeconds++;
          this.time = this.datePipe.transform(
            this.elapsedSeconds * 1000,
            'HH:mm:ss',
            'UTC'
          )!;
        });
    }
  }

  /**
   * Handles the event when the "Wait" button is clicked.
   */
  waitClick(): void {
    this.waitClick$.next();
  }

  /**
   * Resets the stopwatch, setting the elapsed time back to zero.
   */
  reset(): void {
    if (this.isRunning) {
      this.toggle();
    }
    this.elapsedSeconds = 0;
    this.time = '00:00:00';
  }

  /**
   * Configures the behavior for the "Wait" button double-click within a 300ms window.
   * Pauses the stopwatch if conditions are met.
   */
  private setupWaitHandler(): void {
    this.waitClick$
      .pipe(
        buffer(this.waitClick$.pipe(debounceTime(300))),
        filter((clicks) => clicks.length >= 2)
      )
      .subscribe(() => {
        if (this.isRunning) {
          this.toggle();
        }
      });
  }
}
