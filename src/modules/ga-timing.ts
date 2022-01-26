let reported = false
/**
 * report loading time
 * @param vm vue instance
 * @doc https://developers.google.com/analytics/devguides/collection/gtagjs/user-timings
 */
export function gaTiming (vm: any) {
  if (reported) {
    return
  }

  reported = true
  // Feature detects Navigation Timing API support.
  if (window.performance) {
    // Gets the number of milliseconds since page load
    // (and rounds the result since the value must be an integer).
    const timeSincePageLoad = Math.round(performance.now())

    // Sends the timing event to Google Analytics.
    vm.$gtag('event', 'timing_complete', {
      name: 'real_loaded',
      value: timeSincePageLoad
    })
  }
}
