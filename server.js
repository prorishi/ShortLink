const express = require("express");
const fs = require("fs");
const fetch = require("node-fetch");

const captchas = {};
let links;

function fetchLinks() {
    links = JSON.parse(file("links.json"));
}
function setLinks(short, original) {
    fetchLinks();
    if (Object.keys(links).includes(short)) {
        return false;
    } else {
        links[short] = original;
        fs.writeFileSync("./links.json", JSON.stringify(links));
        return true;
    }
}

function file(path) {
    return fs.readFileSync(path, {
        encoding: "utf-8",
        flag: "r",
    });
}

const server = express();
server.use(
    express.urlencoded({
        extended: false,
    })
);

server.get("/", (request, response) => {
    fetch("https://www.random.org/strings/?num=2&len=5&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new")
        .then((fetched) => {
            fetched.text().then((text) => {
                let [captcha, secode] = text.split('\n');
                console.log(captchas);
                captchas[secode] = captcha;
                console.log(captcha);
                response.end(file("./views/index.html").replace("{{captcha}}", captcha).replace(/{{secode}}/g, secode));
            });
        })
        .catch((error) => {
            response.end("Something's wrong\nplease try later");
        });
});

server.post("/shorten", (request, response) => {
    console.log(request.ip);
    console.log(request.body.captchaResponse, captchas[request.ip]);
    console.log(request.body.captchaResponse == captchas[request.ip]);
    if (request.body.captchaResponse == captchas[request.ip]) {
        response.sendFile(__dirname + '/views/shorten.html');
    } else {
        response.end("not valid");
    }
    console.log(request.body.captchaResponse);
});

server.post('/', (request, response) => {
    response.end('awesome')
})

server.listen(process.env.PORT || 3000, '0.0.0.0');

//https://www.random.org/strings/?num=2&len=20&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new
