import express from "express";

const app = express();
app.disable("x-powered-by");
app.use(express.static("public", {
  etag: true,
  maxAge: "1h"
}));

app.get("*", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

const port = Number(process.env.PORT || 8080);
app.listen(port, "0.0.0.0", () => {
  console.log(`Static Runner listening on http://0.0.0.0:${port}`);
});
