import supertest from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import { cleanUpDatabase } from "./utils.js";

describe("Game API", () => {
  let token;
  let gameId;

  beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await cleanUpDatabase();

    // Créer un utilisateur et obtenir un token JWT
    const userRes = await supertest(app)
      .post("/user")
      .send({
        username: "Juser2",
        email: "juser2@example.com",
        password: "johnDoe123@",
      })
      .expect(201)
      .expect("Content-Type", /json/);

    token = userRes.body.token; // Stocker le token JWT pour les tests

    // Créer un jeu
    const gameRes = await supertest(app)
      .post("/game")
      .set("Authorization", `Bearer ${token}`)
      .send({
        session_id: "60d5f9b5f8d2c72b8c8e4b8e",
        game_mode_id: "60d5f9b5f8d2c72b8c8e4b8f",
        team_1_id: "60d5f9b5f8d2c72b8c8e4b90",
        team_2_id: "60d5f9b5f8d2c72b8c8e4b91",
      })
      .expect(201)
      .expect("Content-Type", /json/);

    gameId = gameRes.body.game._id; // Stocker l'ID du jeu
  });

  it("should create a game", async () => {
    const res = await supertest(app)
      .post("/game")
      .set("Authorization", `Bearer ${token}`)
      .send({
        session_id: "60d5f9b5f8d2c72b8c8e4b8e",
        game_mode_id: "60d5f9b5f8d2c72b8c8e4b8f",
        team_1_id: "60d5f9b5f8d2c72b8c8e4b90",
        team_2_id: "60d5f9b5f8d2c72b8c8e4b91",
      })
      .expect(201)
      .expect("Content-Type", /json/);

    expect(res.body).toEqual(
      expect.objectContaining({
        message: "Game successfully created",
        game: expect.objectContaining({
          _id: expect.any(String),
          session_id: "60d5f9b5f8d2c72b8c8e4b8e",
          game_mode_id: "60d5f9b5f8d2c72b8c8e4b8f",
          team_1_id: "60d5f9b5f8d2c72b8c8e4b90",
          team_2_id: "60d5f9b5f8d2c72b8c8e4b91",
        }),
      })
    );
  });

  it("should retrieve the list of games", async () => {
    const res = await supertest(app)
      .get("/game")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body.games).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          session_id: "60d5f9b5f8d2c72b8c8e4b8e",
          game_mode_id: "60d5f9b5f8d2c72b8c8e4b8f",
          team_1_id: "60d5f9b5f8d2c72b8c8e4b90",
          team_2_id: "60d5f9b5f8d2c72b8c8e4b91",
        }),
      ])
    );
  });

  it("should close a game", async () => {
    const res = await supertest(app)
      .put(`/game/${gameId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should get game statistics", async () => {
    const res = await supertest(app)
      .get("/game/stats")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          totalGames: expect.any(Number),
        }),
      ])
    );
  });

  it("should calculate the winner of a game", async () => {
    const res = await supertest(app)
      .post("/game/result")
      .send({
        gameId: gameId,
        team1Id: "60d5f9b5f8d2c72b8c8e4b90",
        team2Id: "60d5f9b5f8d2c72b8c8e4b91",
        team1Timestamp: "2023-10-01T12:00:00Z",
        team2Timestamp: "2023-10-01T12:00:01Z",
      })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toEqual({
      winnerId: "60d5f9b5f8d2c72b8c8e4b90",
    });
  });

  afterAll(async () => {
    await mongoose.connection.close(); // Fermer la connexion à la base de données
  });
});
