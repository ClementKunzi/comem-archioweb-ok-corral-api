import supertest from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import { cleanUpDatabase } from "./utils.js";

describe("Session API", () => {
  let token;
  let sessionId;

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

    // Créer une session
    const sessionRes = await supertest(app)
      .post("/session")
      .set("Authorization", `Bearer ${token}`)
      .expect(201)
      .expect("Content-Type", /json/);

    sessionId = sessionRes.body.session._id; // Stocker l'ID de la session
  });

  it("should create a session", async () => {
    const res = await supertest(app)
      .post("/session")
      .set("Authorization", `Bearer ${token}`)
      .expect(201)
      .expect("Content-Type", /json/);

    /*
    expect(res.body).toEqual(
      expect.objectContaining({
        message: "Session successfully created",
        session: expect.objectContaining({
          _id: expect.any(String),
          game_id: "60d5f9b5f8d2c72b8c8e4b8e",
          session_code: "DEF456",
          status: "open",
        }),
      })
    );*/
  });

  it("should retrieve the list of sessions", async () => {
    const res = await supertest(app)
      .get("/session")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/);
    /*
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          session_code: "ABC123",
          status: "open",
        }),
      ])
    );*/
  });

  it("should close a session", async () => {
    const res = await supertest(app)
      .patch(`/session/close/${sessionId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/);
    /*
    expect(res.body).toEqual(
      expect.objectContaining({
        message: "Session successfully closed",
        session: expect.objectContaining({
          _id: sessionId,
          status: "closed",
        }),
      })
    );*/
  });

  afterAll(async () => {
    await mongoose.connection.close(); // Fermer la connexion à la base de données
  });
});
