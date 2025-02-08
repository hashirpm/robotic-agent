export function scheduleTweet(
  eventDate: Date,
  offsetMs: number,
  tweetFunction: () => Promise<void>
) {
  const tweetTime = new Date(eventDate.getTime() + offsetMs);
  const timeUntilTweet = tweetTime.getTime() - Date.now();

  // Check if the delay is too large
  if (timeUntilTweet > 0) {
    if (timeUntilTweet > 2_147_483_647) {
      console.log(
        `Delay too large for setTimeout, breaking into smaller intervals.`
      );

      // Split into smaller chunks, e.g., 2-hour intervals
      const maxDelay = 2_147_483_647; // Max delay for setTimeout
      let remainingTime = timeUntilTweet;

      // Set intervals of maxDelay
      while (remainingTime > maxDelay) {
        setTimeout(async () => {
          await tweetFunction();
        }, maxDelay);
        remainingTime -= maxDelay;
      }

      // Set the final smaller delay
      setTimeout(async () => {
        await tweetFunction();
      }, remainingTime);
    } else {
      console.log(`Tweet scheduled at ${tweetTime.toISOString()}`);
      setTimeout(async () => {
        await tweetFunction();
      }, timeUntilTweet);
    }
  } else {
    console.log(
      `Skipped scheduling tweet, time already passed: ${tweetTime.toISOString()}`
    );
  }
}
