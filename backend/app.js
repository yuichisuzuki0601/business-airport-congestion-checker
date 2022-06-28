import express from "express";
import path from "path";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import places from "./places.json";
import dummys from "./dummys.json";

const CLASS_CONGESTION_TABLE = {
  c1: "low",
  c2: "middle",
  c3: "high",
};

const mode = process.env.mode || "prod";
console.log("mode:", mode);

const app = express();
app.use(express.static(path.resolve(__dirname, "../frontend")));

const port = 3000;
app.listen(port, () => {
  console.log(`Node.js is listening to PORT: ${port}`);
});

Object.entries(places).forEach(([key], index) => {
  places[key].order = index + 1;
});

app.get("/api/statuses", async (_, res) => {
  const page = await fetch("https://mypage.business-airport.net/login");
  const document = new JSDOM(await page.text()).window.document;
  let results =
    mode === "dummy"
      ? dummys
      : Array.from(document.querySelectorAll(".swiper-slide > dl")).map((info) => {
          const result = {};
          result.name = info.querySelector("dt > a").textContent;
          result.open = info.querySelector("dd > span").textContent === "営業中";
          Array.from(info.querySelectorAll("dd > div")).forEach((status) => {
            const span = status.querySelector("span");
            if (span) {
              switch (span.textContent) {
                case "打合席":
                  result.meetingSpace = CLASS_CONGESTION_TABLE[status.className];
                  break;
                case "1名席":
                  result.individualSpace = CLASS_CONGESTION_TABLE[status.className];
                  break;
                case "更新日":
                  result.updatedAt = status.textContent.replace(/更新日/, "").trim();
                  break;
              }
            }
          });
          return result;
        });
  const merged = results.map((result) => ({ ...result, ...places[result.name] }));
  const sorted = merged.sort((l, r) => l.order - r.order);
  sorted.push({
    alias: 'うんこ'
  })
  res.status(200).json(sorted);
});
