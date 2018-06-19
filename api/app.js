let fs = require('fs');
let path = require('path');
let express = require('express');
let multer = require('multer');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/img/')
    },
    filename: function (req, file, cb) {
        console.dir(file);
        cb(null, fileToName(req, file));
    }
  })
  
let upload = multer({ storage: storage })

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

let dateToStamp = (date) => {
    let year = date.getFullYear();
    let month = date.getMonth() + 1 + "";
    if (month.length < 2) {
        month = "0" + month;
    }
    let day = date.getDate() + "";
    if (day.length < 2) {
        day = "0" + day;
    }

    return {
        year,
        month,
        day,
    };
};

let fileToName = (req, file) => {
    let date = dateToStamp(new Date(req.body.date));
    return `${date.year}-${date.month}-${date.day}-${req.body.title}${path.extname(file.originalname)}`;
};

app.get('/', (req, res) => {
    return res.send('Hello World');
});

app.post('/', upload.fields([{ name: 'image', maxCount: 1 }]), (req, res) => {
    console.dir(req.body);
    console.dir(req.files);

    let date = dateToStamp(new Date(req.body.date));

    let filename = `_posts/${date.year}-${date.month}-${date.day}-${req.body.title}.md`;
    fs.writeFile(filename, template(req.body.author, req.files.image[0].filename, req.body.content));

    res.sendFile(path.resolve(filename));
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});