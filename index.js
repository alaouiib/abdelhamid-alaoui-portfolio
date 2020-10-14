const express = require("express");
const app = express();
const fetch = require("node-fetch");
// middleware
app.use(express.static("public"));
app.set("view engine", "ejs");

// app.use(express.json());
let users = [];

const getIP = async (users) => {
  const getIpURL = "http://gd.geobytes.com/GetCityDetails";
  const getIpInfoURL = "https://api.hackertarget.com/geoip/?q=";

  let res = await fetch(getIpURL);
  let { geobytesipaddress: ip } = await res.json();
  let resInfoIP = await fetch("https://api.hackertarget.com/geoip/?q=" + ip, {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language":
        "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ar-MA;q=0.6,ar;q=0.5",
      "cache-control": "max-age=0",
      "sec-ch-ua":
        '"Chromium";v="86", "\\"Not\\\\A;Brand";v="99", "Google Chrome";v="86"',
      "sec-ch-ua-mobile": "?0",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "sec-gpc": "1",
      "upgrade-insecure-requests": "1",
    },
    method: "GET",
    mode: "cors",
    credentials: "omit",
  });
  let infos = await resInfoIP.text();

  const found = users.some((el) => el.userIP == ip);
  if (!found) {
    console.log("not found");
    let newVisitor = { userIP: ip, Nbvisits: 1, infos: infos };
    users.push(newVisitor);
  } else {
    console.log("found");
    let oldVisitor = users.find((x) => x.userIP == ip);
    oldVisitor.Nbvisits += 1;
    // console.log(users);
  }

  return users;
};

let counter = 0;
app.get("/", async function (req, res) {
  counter++;
  console.log("ip infos:", await getIP(users));
  // - get ip and infos about ip
  // - increment num of visits for each user
  console.log("visitors:", counter);
  res.render("index");
  // res.redirect("/visited");
});
let en_count_dl = 0;
let fr_count_dl = 0;

app.get("/admin/downloaded", (req, res) => {
  const { en, fr } = req.query;
  if (en || fr) {
    en_count_dl += parseInt(en);
    fr_count_dl += parseInt(fr);
  }
  if (en > 0) {
    res.json({
      msg: "Downloads incremented for the English Resume !",
      nb_dow: en_count_dl,
      msg_to_geeks:
        "This is just to know how many times my cv got downloaded !",
    });
  } else if (fr > 0) {
    res.json({
      msg: "Downloads incremented for the French CV !",
      nb_dow: fr_count_dl,
      msg_to_geeks:
        "This is just to know how many times my cv got downloaded !",
    });
  } else {
    res.json({
      fr: fr_count_dl,
      en: en_count_dl,
      msg_to_geeks:
        "This is just to know how many times my cv got downloaded !",
    });
  }
});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Listening on 3000");
});
