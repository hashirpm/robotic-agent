import { generateMatchReminderTweet, generateMatchStartTweet, generateParticipantTweet, generateRaceCreationTweet, generateStakingEndTweet, generateStakingStartTweet } from "./race-tweets";

async function generateTweets() {
  const raceCreationTweet = await generateRaceCreationTweet(
    "AgentAlpha",
    "AgentBeta",
    "2023-12-15"
  );
  console.log("Race Creation Tweet:", raceCreationTweet);

  const participantTweet = await generateParticipantTweet(
    "feeder_ai",
    "aixbt_agent"
  );
  console.log("Participant Tweet:", participantTweet);

  const stakingStartTweet = await generateStakingStartTweet();
  console.log("Staking Start Tweet:", stakingStartTweet);

  const stakingEndTweet = await generateStakingEndTweet();
  console.log("Staking End Tweet:", stakingEndTweet);

  const matchReminderTweet = await generateMatchReminderTweet("2023-12-15");
  console.log("Match Reminder Tweet:", matchReminderTweet);

  const matchStartTweet = await generateMatchStartTweet(
    "AgentAlpha",
    "AgentBeta"
  );
  console.log("Match Start Tweet:", matchStartTweet);
}

generateTweets();
