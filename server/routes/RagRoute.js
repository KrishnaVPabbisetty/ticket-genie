const express = require("express");
const axios = require("axios");
const router = express.Router();
const {
    fetchShowtimesFromDatabase,
    fetchTheatersFromDatabase,
    fetchMoviesFromDatabase,
    fetchGenresFromDatabase,
    fetchMovieLanguages,
} = require("../Helpers/QueryHandlers");

router.post("/query", async (req, res) => {
    console.log(req.body);
    const { query } = req.body;

    if (!query || query.trim() === "") {
        return res.status(400).json({
            message: "Query cannot be empty. Please provide a valid question.",
        });
    }

    try {
        // Step 1: Call OpenAI API for intent and entity extraction
        const openaiResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    {
                        role: "user",
                        content: `Extract the intent and entities (movie, theater, city, genre, language, date, ticket_price_range) from this query. Return the result in JSON format: "${query}"`,
                    },
                ],
                temperature: 0.5,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const responseContent =
            openaiResponse?.data?.choices?.[0]?.message?.content;

        if (!responseContent) {
            throw new Error("OpenAI API returned an unexpected response structure.");
        }

        console.log("Debug - Raw OpenAI API Response:", responseContent);

        // Parse the OpenAI API response
        const parsedResponse = JSON.parse(responseContent);
        const { intent, entities } = parsedResponse;

        console.log("Debug - Parsed Intent:", intent);
        console.log("Debug - Parsed Entities:", entities);

        if (!entities || typeof entities !== "object") {
            return res.status(400).json({
                status: "error",
                message:
                    "Entities could not be extracted from your query. Please refine your query and try again.",
            });
        }

        // Step 2: Handle intent and fetch data from the database
        let response;
        switch (intent.toLowerCase()) {
            case "findshowtimes":
            case "showtimesrequest":
                console.log("Debug - Handling FindShowtimes intent...");
                response = await fetchShowtimesFromDatabase(entities);
                break;
            case "listtheaters":
                console.log("Debug - Handling ListTheaters intent...");
                response = await fetchTheatersFromDatabase(entities);
                break;
            case "findmovies":
                console.log("Debug - Handling FindMovies intent...");
                response = await fetchMoviesFromDatabase(entities);
                break;
            case "getgenres":
                console.log("Debug - Handling GetGenres intent...");
                response = await fetchGenresFromDatabase(entities);
                break;
            case "findlanguages":
                console.log("Debug - Handling FindLanguages intent...");
                response = await fetchMovieLanguages(entities);
                break;
            default:
                response = {
                    message: "Intent recognized, but no handler for this query type.",
                    intent,
                    entities,
                };
        }

        if (!response || (Array.isArray(response) && response.length === 0)) {
            response = { message: "No results found matching your query." };
        }

        // Step 3: Send the response back to the user
        res.status(200).json({
            status: "success",
            message: `Query processed successfully for intent: ${intent}`,
            data: response,
        });
    } catch (error) {
        console.error(
            "Error processing query:",
            error.response?.data || error.message
        );
        res.status(500).json({
            message: "An error occurred while processing your query.",
            details: error.response?.data || error.message,
        });
    }
});

module.exports = router;
