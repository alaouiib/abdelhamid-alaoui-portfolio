const express = require("express");
const app = express();
const fs = require("fs");

require("dotenv").config();
var API_KEY = process.env["API_KEY"];
var DOMAIN = "sandbox35661a599b8d41118479a26a2da62b8f.mailgun.org"; // not confidential
var mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });
const fetch = require("node-fetch");
// middleware
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
global.users = {
  users: [],
};
const getIPinfo = async (ip) => {
  const getIpInfoURL = "https://api.hackertarget.com/geoip/?q=";
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

  fs.readFile("db.json", "utf8", function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      var obj = JSON.parse(data); //now it an object
      global.users.users = obj.users;
      console.log("----");
      console.log(global.users.users);
      console.log("----");
      const found = global.users.users.some((el) => el.userIP == ip);
      if (!found) {
        console.log("not found, New user detected !");
        let newVisitor = { userIP: ip, Nbvisits: 1, infos: infos };
        global.users.users.push(newVisitor);
        var json = JSON.stringify(global.users); //convert it back to json
        fs.writeFile("db.json", json, "utf8", () => {
          console.log("written to DB successfully !");
        }); // write it back
        // send email notification
        const data = {
          from: "News portfolio <coucou@coucou.org>",
          to: "alaouiib.fstt@gmail.com",
          subject: `New visitor Notification !`,
          text: `${JSON.stringify(newVisitor)}`,
        };
        mailgun.messages().send(data, (error, body) => {
          console.log(`message sent successfully !`);
          console.table(body);
        });
      } else {
        console.log("found");
        let oldVisitor = global.users.users.find((x) => x.userIP == ip);
        oldVisitor.Nbvisits += 1;
        console.log(global.users.users);
        var json = JSON.stringify(global.users); //convert it back to json

        fs.writeFile("db.json", json, "utf8", () => {
          console.log("written to DB successfully !");
        });
        // console.log(users);
      }
      // console.log(global.users);
    }
  });

  return global.users;
};

// let counter = 0;
app.get("/", async function (req, res) {
  res.render("index");
});
app.post("/admin/get_visitors", async function (req, res) {
  let { ip: user_ip } = req.body;
  // console.log(user_ip);

  let new_users = await getIPinfo(user_ip, users);
  // console.log(new_users);

  res.json({ new_users });
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
    const data = {
      from: "portfolio news: EN Resume's been downloaded ! <coucou@coucou.org>",
      to: "alaouiib.fstt@gmail.com",
      subject: `New en Resume download Notification !`,
      text: `EN resume has been downloaded ${en_count_dl} times`,
    };
    mailgun.messages().send(data, (error, body) => {
      console.log(`message sent successfully !`);
      // console.table(body);
    });
    res.json({
      msg: "Downloads incremented for the English Resume !",
      nb_dow: en_count_dl,
      msg_to_geeks:
        "This is just to know how many times my cv got downloaded !",
    });
  } else if (fr > 0) {
    const data = {
      from: "portfolio news: French CV's been downloaded ! <coucou@coucou.org>",
      to: "alaouiib.fstt@gmail.com",
      subject: `New french CV download Notification !`,
      text: `FR CV has been downloaded ${fr_count_dl} times`,
    };
    mailgun.messages().send(data, (error, body) => {
      console.log(`message sent successfully !`);
      // console.table(body);
    });
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
app.get("/admin/visitors", (req, res) => {
  fs.readFile("db.json", "utf8", function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      var users = JSON.parse(data); //now it an object
      res.json(users);
    }
  });
  // res.json({ users });
});

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Listening on ", process.env.PORT || 3000);
});
const request = require("request");
const ping = () =>
  request("https://abdelhamid-pro.herokuapp.com/", (error, response, body) => {
    console.log("error:", error); // Print the error if one occurred
    console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
    // console.log("body:", body); // Print body of response received
  });
setInterval(ping, 4.5 * 60 * 1000); // I have set to 20 mins interval
