import express from "express";
import type { Application, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
const app: Application = express();
const PORT = process.env.PORT || 7000;

// * Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
  return res.send("It's working 🙌");
});

// Random quotes array
const quotes: string[] = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "Life is what happens to you while you're busy making other plans. - John Lennon",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "It is during our darkest moments that we must focus to see the light. - Aristotle",
  "The only impossible journey is the one you never begin. - Tony Robbins",
  "In the middle of difficulty lies opportunity. - Albert Einstein",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Don't let yesterday take up too much of today. - Will Rogers",
  "You learn more from failure than from success. - Unknown",
  "If you are working on something exciting that you really care about, you don't have to be pushed. The vision pulls you. - Steve Jobs",
  "People who are crazy enough to think they can change the world, are the ones who do. - Rob Siltanen",
  "Optimism is the one quality more associated with success and happiness than any other. - Brian Tracy",
  "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
];

// Route to stream random quotes every 3 seconds
app.get("/quotes", (req: Request, res: Response) => {
  // Set headers for Server-Sent Events
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Function to get random quote
  const getRandomQuote = (): string => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  // Send initial quote
  res.write(`data: ${JSON.stringify({ quote: getRandomQuote(), timestamp: new Date().toISOString() })}\n\n`);

  // Send a new random quote every 3 seconds
  const intervalId = setInterval(() => {
    const quote = getRandomQuote();
    const data = JSON.stringify({
      quote: quote,
      timestamp: new Date().toISOString(),
    });
    res.write(`data: ${data}\n\n`);
  }, 3000);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(intervalId);
    res.end();
  });
});


app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));


