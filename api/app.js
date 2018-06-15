let fs = require('fs');
let path = require('path');
let express = require('express');

const app = express();

const port = (process.env.PORT || 3000);
app.set('port', port);

// app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
  next();
});

let template = (author, image, content) => `\
---\n\
layout: post\n\
author: ${author}
image: ${image}
---\n\
\n\
${content}\n\
`;

app.post('/', (req, res) => {
    console.dir(req.body);

    let date = new Date(req.body.date);
    let year = date.getFullYear();
    let month = date.getMonth() + 1 + "";
    if (month.length < 2) {
        month = "0" + month;
    }
    let day = date.getDate() + "";
    if (day.length < 2) {
        day = "0" + day;
    }

    let filename = `_posts/${year}-${month}-${day}-test.md`;
    fs.writeFile(filename, template(req.body.author, 'img.png', req.body.content));

    res.sendFile(path.resolve(filename));
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});