const { ScreenModel } = require("../models/ScreenModel");
const TheaterModel = require("../models/TheaterModel");
const MovieModel = require("../models/MovieModel");

const fetchShowtimesFromDatabase = async (entities) => {
    const { movie, city } = entities;

    if (!movie || !city) {
        return { message: "Movie or city information is missing." };
    }

    try {
        const screens = await ScreenModel.find({
            movie_name: new RegExp(movie, "i"),
            city: new RegExp(city, "i"),
        });

        if (!screens || screens.length === 0) {
            return { message: `No showtimes found for "${movie}" in "${city}".` };
        }

        return screens.map((screen) => ({
            theater: screen.name,
            show_timings: screen.show_timings,
            seating_capacity: screen.seating_capacity,
            ticket_cost: screen.cost,
        }));
    } catch (error) {
        console.error("Database query failed:", error.message);
        throw new Error("Failed to fetch showtimes. Please try again.");
    }
};

const fetchTheatersFromDatabase = async (entities) => {
    const { city } = entities;

    if (!city) {
        return { message: "City information is missing." };
    }

    try {
        const theaters = await TheaterModel.find({
            city: new RegExp(city, "i"),
        }).select("name address contact_number");

        if (!theaters || theaters.length === 0) {
            return { message: `No theaters found in "${city}".` };
        }

        return theaters.map((theater) => ({
            name: theater.name,
            address: theater.address,
            contact_number: theater.contact_number || "Not Available",
        }));
    } catch (error) {
        console.error("Database query failed:", error.message);
        throw new Error("Failed to fetch theaters. Please try again.");
    }
};

const fetchMoviesFromDatabase = async (entities) => {
    const { genre, city } = entities;

    try {
        const query = {};
        if (genre) query.genres = new RegExp(genre, "i");
        if (city) query.city = new RegExp(city, "i");

        const movies = await MovieModel.find(query).select(
            "title genres runtime languages poster"
        );

        if (!movies || movies.length === 0) {
            return { message: "No movies found matching your criteria." };
        }

        return movies.map((movie) => ({
            title: movie.title,
            genres: movie.genres,
            runtime: movie.runtime,
            languages: movie.languages,
            poster: movie.poster,
        }));
    } catch (error) {
        console.error("Database query failed:", error.message);
        throw new Error("Failed to fetch movies. Please try again.");
    }
};

const fetchGenresFromDatabase = async (entities) => {
    const { movie } = entities;

    if (!movie) {
        return { message: "Movie information is missing." };
    }

    try {
        const movieDetails = await MovieModel.findOne({
            title: new RegExp(movie, "i"),
        }).select("genres");

        if (!movieDetails) {
            return { message: `No genres found for "${movie}".` };
        }

        return { genres: movieDetails.genres };
    } catch (error) {
        console.error("Database query failed:", error.message);
        throw new Error("Failed to fetch genres. Please try again.");
    }
};

const fetchMovieLanguages = async (entities) => {
    const { movie } = entities;

    if (!movie) {
        return { message: "Movie information is missing." };
    }

    try {
        const movieDetails = await MovieModel.findOne({
            title: new RegExp(movie, "i"),
        }).select("languages");

        if (!movieDetails) {
            return { message: `No language information found for "${movie}".` };
        }

        return { languages: movieDetails.languages };
    } catch (error) {
        console.error("Database query failed:", error.message);
        throw new Error("Failed to fetch languages. Please try again.");
    }
};

module.exports = {
    fetchShowtimesFromDatabase,
    fetchTheatersFromDatabase,
    fetchMoviesFromDatabase,
    fetchGenresFromDatabase,
    fetchMovieLanguages,
};