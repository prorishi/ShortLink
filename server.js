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
                let [captcha, sessionToken] = text.split("\n");
                console.log(captchas);
                console.log(sessionToken);
                captchas[sessionToken] = captcha;
                console.log(captcha);
                response.end(file("./views/index.html").replace("{{captcha}}", captcha).replace("{{sessionToken}}", sessionToken));
            });
        })
        .catch((error) => {
            response.end("Something's wrong\nplease try later");
        });
});

server.post("/shorten", (request, response) => {
    let { captchaResponse, sessionToken } = request.body;
    console.log(sessionToken);
    console.log(captchaResponse, captchas[sessionToken]);
    console.log(captchaResponse == captchas[sessionToken]);
    if (captchaResponse == captchas[sessionToken]) {
        response.sendFile(__dirname + "/views/shorten.html");
    } else {
        response.end("not valid");
    }
    delete captchas[sessionToken];
});

server.post("/", (request, response) => {
    fetchLinks();
    let { original, custom } = request.body;
    if (setLinks(custom, original)) {
        response.end("awesome");
    } else {
        response.end("not awesome");
    }
});

server.get('/:short', (request, response) => {
    fetchLinks()
    console.log(links);
    if (Object.keys(links).includes(request.params.short)) {
        response.redirect(links[request.params.short])
    } else {
        response.status(404)
    }
})

server.listen(process.env.PORT || 3000);

//https://www.random.org/strings/?num=2&len=20&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new
