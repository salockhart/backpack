let fs = require('fs');
let path = require('path');
let express = require('express');
let multer = require('multer');
let { exec } = require('child_process');
let sanitize = require('sanitize-filename');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');

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

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/img/')
    },
    filename: function (req, file, cb) {
        cb(null, `${getFileName(req.body.date, req.body.title)}${path.extname(file.originalname)}`);
    }
})
  
let upload = multer({ storage: storage })

app.get('/', (req, res) => {
    return res.send('Hello World');
});

app.post('/hash', upload.fields([]), (req, res) => {
    console.log(`Hashing with ${JSON.stringify(req.body)}`);
    bcrypt.hash(req.body.password, 10, function(err, hash) {
        if (err) {
            return console.error(err);
        }
        res.send(`${req.body.username}:${hash}`);
    });
});

app.post('/login', upload.fields([]), (req, res) => {
    console.log(`Logging in with ${JSON.stringify(req.body)}`);
    let users = process.env.USERS.split(',').map(user => ({ username: user.split(':')[0], hash: user.split(':')[1] }));
    Promise.all(users.map(user => bcrypt.compare(req.body.password, user.hash)))
        .then(loggedIn => users.map((user, idx) => Object.assign({}, user, { loggedIn: loggedIn[idx] })))
        .then(users => users.find(user => user.loggedIn))
        .then(user => {
            if (!user) {
                return res.sendStatus(400);
            }
            jwt.sign({ username: user.username }, process.env.JWT_SECRET, (signErr, token) => {
                if (signErr) {
                    console.error(signErr);
                    return res.sendStatus(500);
                }
                return res.send(token);
            });
        });
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

app.post('/', upload.fields([{ name: 'image', maxCount: 1 }]), (req, res) => {
    console.log(`Creating new post with ${JSON.stringify(req.body)}`);
    let token = req.headers.authorization;

    if (!token) {
        return res.sendStatus(400);
    }

    jwt.verify(token, process.env.JWT_SECRET, (verifyErr, decodedToken) => {
        if (verifyErr) {
            console.error(verifyErr);
            return res.sendStatus(400);
        }
    
        let filename = getFileName(req.body.date, req.body.title);
        if (filename.length === 0) {
            return res.sendStatus(400);
        }
        let path = `_posts/${filename}.md`;
        let post = template(req.body.author, req.files.image[0].filename, req.body.content);
        fs.writeFile(path, post, (err) => {
            if (err) {
                console.error(`Error saving file: ${err}`);
                return res.sendStatus(500);
            }

            exec(`git add _posts assets/img && git commit -m "${filename}" && git push`, (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error saving file: ${err} ${stderr}`);
                    return res.sendStatus(500);
                }
                res.sendStatus(200);
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});