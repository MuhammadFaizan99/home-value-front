import express from "express";
import Scraper from "./scraper.js";
import bodyParser from "body-parser";
import cors from "cors";
import  { dirname } from "path";
import dotenv from "dotenv";
dotenv.config();
import { fileURLToPath } from "url";


global.__dirname = () => dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 8000 || process.env.PORT

app.disable("x-powered-by");

// app.set("view engine", "ejs");

app.use(express.json());
// app.use(express.static(path.join(__dirname(), "views")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cors({ origin: "*" }));

const scraper = new Scraper();

// app.get("/", async (req, res) => {
//   res.render("index.ejs");
// });

app.post("/home_value", async (req, res) => {
  if (!req.body.address)
    return res.json({ status: 401, message: "Please enter the address." });
  let response;

  try {
    response = await scraper.scrapeLocationData(req.body.address);
  } catch (err) {
    response = err;
  }
  res.json({ status: 200, response });
});
app.listen(PORT, () => console.log(`listening on port ${PORT}`));