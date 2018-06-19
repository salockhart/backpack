git init
git remote add origin https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/salockhart/backpack.git
git fetch --all
git clean -df
git checkout -b api origin/api
git config user.email "salexlockhart@gmail.com"
git config user.name "Alex Lockhart"
git config --global push.default matching
node api/app.js
