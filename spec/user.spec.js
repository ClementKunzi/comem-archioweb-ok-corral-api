import supertest from "supertest";
import mongoose from "mongoose";
import { cleanUpDatabase } from "./utils.js";
import server from "../server.js"; // Importer le serveur

describe("User API", () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await cleanUpDatabase();

    // Créer un utilisateur et obtenir un token JWT
    const res = await supertest(server)
      .post("/user")
      .send({
        username: "Juser2",
        email: "juser2@example.com",
        password: "johnDoe123@",
      })
      .expect(201)
      .expect("Content-Type", /json/);

    token = res.body.token; // Stocker le token JWT pour les tests
    userId = res.body.user._id; // Stocker l'ID utilisateur
  });

  it("should create a user and log them in automatically", async () => {
    const res = await supertest(server)
      .post("/user")
      .send({
        username: "Juser3",
        email: "juser3@example.com",
        password: "johnDoe123@",
      })
      .expect(201)
      .expect("Content-Type", /json/);

    expect(res.body).toEqual(
      expect.objectContaining({
        message: "User successfully created",
        token: expect.any(String),
        user: expect.objectContaining({
          _id: expect.any(String),
          username: "Juser3",
          email: "juser3@example.com",
          isLoggedIn: true,
        }),
      })
    );
  });

  it("should retrieve the list of users", async () => {
    const res = await supertest(server)
      .get("/user")
      .set("Authorization", `Bearer ${token}`) // Utiliser le token JWT pour l'authentification
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          username: "Juser2",
          email: "juser2@example.com",
          isLoggedIn: true,
        }),
      ])
    );
  });

  it("should update a user's username", async () => {
    const res = await supertest(server)
      .put(`/user/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "UpdatedUser",
      })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toEqual(
      expect.objectContaining({
        _id: userId,
        username: "UpdatedUser",
        email: "juser2@example.com",
      })
    );
  });

  it("should logout a user", async () => {
    const res = await supertest(server)
      .post("/user/logout")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({
      message: "Logout successful",
    });
  });

  it("should delete a user", async () => {
    const res = await supertest(server)
      .delete(`/user/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({
      message: "User successfully deleted",
    });
  });

  afterAll(async () => {
    await mongoose.connection.close(); // Fermer la connexion à la base de données
    server.close(); // Arrêter le serveur
  });
});
