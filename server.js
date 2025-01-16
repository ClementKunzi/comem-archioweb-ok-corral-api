import app from "./app.js";

const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default server;
