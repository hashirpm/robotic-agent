import { Scraper, SearchMode } from "agent-twitter-client";
import { Cookie } from "tough-cookie"; // Add this import

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { getAPIKey } from "../nillion-helpers/api-key";


dotenv.config();

const COOKIES_FILE_PATH = path.resolve(__dirname, "cookies.json");
export const scraper = new Scraper();

const loginAndSetCookies = async () => {
  try {
    await clearCookies();
    // Login with username and password
    await scraper.login(
     await getAPIKey("twitterUsername") || process.env.TWITTER_USERNAME!,
      await getAPIKey("twitterPassword") || process.env.TWITTER_PASSWORD!
    );

    // Check if successfully logged in
    const isLoggedIn = await scraper.isLoggedIn();
    console.log("Logged in with credentials:", isLoggedIn);

    if (isLoggedIn) {
      // Get the current session cookies and convert to TwitterCookie format
      const scraperCookies = await scraper.getCookies();
      const serializedCookies = JSON.stringify(scraperCookies);

      fs.writeFileSync(COOKIES_FILE_PATH, serializedCookies);

      console.log("Cookies saved to file as JSON array.");
    } else {
      console.error("Failed to log in.");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

function convertCookiesToStrings(cookiesArray: any) {
  return cookiesArray.map((cookie: any) => {
    if (!cookie.key || !cookie.value || !cookie.domain) {
      throw new Error(
        "Cookie must have at least `key`, `value`, and `domain` fields."
      );
    }

    let cookieString = `${cookie.key}=${cookie.value}; Domain=${
      cookie.domain
    }; Path=${cookie.path || "/"};`;
    if (cookie.secure) cookieString += " Secure;";
    if (cookie.httpOnly) cookieString += " HttpOnly;";
    if (cookie.sameSite) cookieString += ` SameSite=${cookie.sameSite};`;
    if (cookie.expires)
      cookieString += ` Expires=${new Date(cookie.expires).toUTCString()};`;

    return cookieString.trim();
  });
}

export const clearCookies = async () => {
  await scraper.clearCookies();
};

export const checkIsLoggedIn = async () => {
  var bool = await scraper.isLoggedIn();

  if (bool) {
    return "Logged in";
  } else {
    await loginTwitter();
    return "Not logged in";
  }
};

export const loginTwitter = async () => {
  try {
    // Check if cookies file exists
    if (fs.existsSync(COOKIES_FILE_PATH)) {
      console.log("Cookies file found. Logging in using cookies...");

      const savedCookies = fs.readFileSync(COOKIES_FILE_PATH, "utf-8");
      const cookies: string[] = JSON.parse(savedCookies);

      var cookiesString = convertCookiesToStrings(cookies);

      try {
        // Set the cookies for the scraper session
        await scraper.setCookies(cookiesString);

        // Check if cookies are valid and logged in
        const isLoggedIn = await scraper.isLoggedIn();
        console.log("Logged in using cookies:", isLoggedIn);

        if (isLoggedIn) {
          console.log("Successfully logged in with cookies.");
          return;
        } else {
          console.log("Cookies expired, logging in with credentials...");
          await loginAndSetCookies();
        }
      } catch (error) {
        console.error("Error setting cookies:", error);
        await loginAndSetCookies();
      }
    } else {
      console.log("No cookies file found, logging in with credentials...");
      await loginAndSetCookies();
    }
  } catch (error) {
    console.error("Login process failed:", error);
    throw error;
  }
};

export const searchTwitterAPI = async (query: string) => {
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }
  const tweetsResponse = await scraper.fetchSearchTweets(
    query,
    20,
    SearchMode.Latest
  );

  var tweets: any[] = tweetsResponse.tweets;

  // change this this tweet where it only contains the key's text, id, username, views, likes, retweets

  var llmResponse = tweets.map((tweet) => {
    return {
      tweet: tweet.text,
      tweet_id: tweet.id,
      username: tweet.username,
      views: tweet.views,
      likes: tweet.likes,
      retweets: tweet.retweets,
    };
  });

  return JSON.stringify(llmResponse);
};

export const searchAboutaTokenAPI = async (symbol: string) => {
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }
  console.log("searching for token", symbol);
  const tweetsResponse = await scraper.fetchSearchTweets(
    `$${symbol}`,
    20,
    SearchMode.Latest
  );

  var tweets: any[] = tweetsResponse.tweets;

  var llmResponse = tweets.map((tweet) => {
    return {
      tweet: tweet.text,
      tweet_id: tweet.id,
      username: tweet.username,
      views: tweet.views,
      likes: tweet.likes,
      retweets: tweet.retweets,
    };
  });

  return JSON.stringify(llmResponse);
};

export const createTweetAPI = async (tweet: string) => {
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }
  try {
    await scraper.sendTweet(tweet);
  } catch (e) {
    console.error("Error sending tweet:", e);
  }
};

export const formatTweet = (tweet: string): string => {
  // Use a regular expression to match and remove all occurrences of '**'
  const cleanedTweet = tweet.replace(/\*\*/g, "");
  return cleanedTweet;
};

export const sentLongTweet = async (tweet: string) => {
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }
  try {
    var cleanedTweet = formatTweet(tweet);
    await scraper.sendLongTweet(cleanedTweet);
  } catch (e) {
    console.error("Error sending tweet:", e);
  }
};

export const readTwitterHomeTimeline = async () => {
  console.log(await scraper.isLoggedIn());
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }
  // Assume `tweets` is the data you provided
  const tweets = await scraper.fetchHomeTimeline(50, []);

  var responseTweets: any[] = [];

  // Loop through the tweets and access elements inside the `legacy` object
  tweets.forEach((tweet: any) => {
    const legacy = tweet.legacy;

    // add the new json into the reponsetweets array
    responseTweets.push({
      tweet: legacy.full_text,
      tweet_id: legacy.conversation_id_str,
      like: legacy.favorite_count,
      retweet: legacy.retweet_count,
      reply: legacy.reply_count,
    });
  });

  console.log(JSON.stringify(responseTweets));

  return JSON.stringify(responseTweets);
};

export const likeTweet = async (tweetId: string) => {
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }

  const response = await scraper.likeTweet(tweetId);

  console.log(response);
};

export const retweetTweet = async (tweetId: string) => {
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }
  const response = await scraper.retweet(tweetId);

  console.log(response);
};

export const replyToTweetAPI = async (tweetId: string, reply_tweet: string) => {
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }
  const response = await scraper.sendTweet(reply_tweet, tweetId);

  console.log(response);
};

// check my profile and analyze
export const checkProfile = async () => {
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }
  const profile = await scraper.me();

  console.log(profile);
};

// follow user
export const followUser = async (username: string) => {
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }
  const response = await scraper.followUser(username);

  console.log(response);
};

// export const searchGrokAboutToken = async (name: string) => {
//   if (!scraper.isLoggedIn) {
//     await loginTwitter();
//   }
//   console.log("searching grok for token", name);
//   const grokResponse = await scraper.grokChat({
//     messages: [
//       {
//         role: "user",
//         content: `give me an detailed tweet by fetching all the details regarding ${name}  Token and all the recent information about the token. Include maximum information.`,
//       },
//     ],
//   });
//   const tokenDetails = grokResponse.messages[1].content;

//   return JSON.stringify(tokenDetails);
// };

export const generateReplyToTweetGrok = async (tweet: string) => {
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }
  const grokResponse = await scraper.grokChat({
    messages: [
      {
        role: "user",
        content: `Gather all recent informations about the tweet:${tweet}, for generating a reply to the tweet. Include maximum information.`,
      },
    ],
  });
  const tokenDetails = grokResponse.messages[1].content;

  return JSON.stringify(tokenDetails);
};

// export const generateReply = async (tweet: string) => {
//   if (!scraper.isLoggedIn) {
//     await loginTwitter();
//   }
//   console.log("searching grok for token", name);
//   const grokResponse = await scraper.grokChat({
//     messages: [
//       {
//         role: "user",
//         content: `give me an detailed tweet by fetching all the details regarding ${name}  Token and all the recent information about the token. Include maximum information.`,
//       },
//     ],
//   });
//   const tokenDetails = grokResponse.messages[1].content;

//   return JSON.stringify(tokenDetails);
// };
export const getProfileOfAnAccount = async (username: string) => {
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }
  // console.log({ username });
  // Assume `tweets` is the data you provided
  const profile = await scraper.getProfile(username);
  // console.log({ profile });

  return JSON.stringify(profile);
};

export const getTweetsOfAnAccount = async (username: string) => {
  if (!(await scraper.isLoggedIn())) {
    await loginTwitter();
  }
  // console.log({ username });

  const userTweets = await scraper.getTweets(username, 10);
  // console.log({ userTweets });

  const responseTweets: any = [];

  // Since userTweets is an AsyncGenerator, we need to iterate through it properly
  for await (const tweet of userTweets) {
    // Check if tweet and legacy exist
    if (tweet) {
      // console.log({ tweet });
      responseTweets.push(tweet);
    }
  }

  // console.log(JSON.stringify(responseTweets));
  return JSON.stringify(responseTweets);
};
