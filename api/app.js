let fs = require('fs');
let path = require('path');
let express = require('express');
let multer = require('multer');
let { exec } = require('child_process');
let sanitize = require('sanitize-filename');

const app = express();

const port = (process.env.PORT || 3000);
app.set('port', port);

app.use(express.urlencoded({
  extended: true,
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
    return res.send('Hello World');
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

let getFileName = (date, title) => {
    let dateObj = new Date(date);
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth() + 1 + "";
    if (month.length < 2) {
        month = "0" + month;
    }
    let day = dateObj.getDate() + "";
    if (day.length < 2) {
        day = "0" + day;
    }
    return sanitize(`${year}-${month}-${day}-${title}`.toLowerCase().replace(/ /g, '-'));
};

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/img/')
    },
    filename: function (req, file, cb) {
        console.dir(file);
        cb(null, `${getFileName(req.body.date, req.body.title)}${path.extname(file.originalname)}`);
    }
})
  
let upload = multer({ storage: storage })
app.post('/', upload.fields([{ name: 'image', maxCount: 1 }]), (req, res) => {
    console.dir(req.body);
    console.dir(req.files);

    let filename = getFileName(req.body.date, req.body.title);
    if (filename.length === 0) {
        return res.sendStatus(400);
    }
    let path = `_posts/${filename}.md`;
    let post = template(req.body.author, req.files.image[0].filename, req.body.content);
    fs.writeFile(path, post, (err) => {
        if (err) {
            return res.sendStatus(500);
        }

        exec(`git add _posts assets/img && git commit -m "${filename}" && git push`, (err, stdout, stderr) => {
            res.sendStatus(200);
        });
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});