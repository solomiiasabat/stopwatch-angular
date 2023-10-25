import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subject, BehaviorSubject } from 'rxjs';
import {
  debounceTime,
  buffer,
  filter,
  takeUntil,
  switchMap,
} from 'rxjs/operators';

/**
 * AppComponent: Provides a basic stopwatch functionality with start, stop, wait, and reset capabilities.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  /** Stores the total elapsed time in seconds. */
  elapsedSeconds = 0;

  /** Subject used to trigger the unsubscription of all observables upon component destruction. */
  private unsubscribe$ = new Subject<void>();

  /** Subject for handling "Wait" button click events. */
  private waitClick$ = new Subject<void>();

  /** BehaviorSubject for maintaining and observing the running state of the stopwatch. */
  runningState$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  /**
   * OnInit lifecycle hook.
   * Sets up the main stopwatch functionality and wait button handler.
   *
   * Switches between counting interval and an empty array based on running state.
   * Unsubscribes from the timer when the component is destroyed or explicitly unsubscribed.
   * Increments the elapsed seconds every second.
   */
  ngOnInit() {
    this.setupWaitHandler();
    this.runningState$
      .pipe(
        switchMap((isRunning) => (isRunning ? interval(1000) : [])),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.elapsedSeconds++;
      });
  }

  /**
   * Cleans up by unsubscribing from all observables to avoid memory leaks.
   */
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Toggles the stopwatch's running state between started and stopped.
   */
  toggle(): void {
    this.runningState$.next(!this.runningState$.value);
  }

  /**
   * Emits a value each time the "Wait" button is clicked.
   */
  waitClick(): void {
    this.waitClick$.next();
  }

  /**
   * Resets the stopwatch, setting elapsed time back to zero.
   */
  reset(): void {
    this.runningState$.next(false);
    this.elapsedSeconds = 0;
  }

  /**
   * Sets up handling for double-click events on the "Wait" button.
   * Collects clicks and emits them as an array.
   * Filters them for double-clicks where the stopwatch is running.
   * Pauses the stopwatch if double-clicked within a 300ms window.
   * Toggles the running state if a double-click is detected.
   */
  private setupWaitHandler(): void {
    this.waitClick$
      .pipe(
        buffer(this.waitClick$.pipe(debounceTime(300))),
        filter((clicks) => clicks.length >= 2 && this.runningState$.value)
      )
      .subscribe(() => {
        this.toggle();
      });
  }
}
