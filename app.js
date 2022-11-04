//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


const rp = require('request-promise');
const axios = require('axios');
const {
  parse
} = require('node-html-parser')



let t = "";
var i=0;
mongoose.connect("mongodb+srv://abhishek:family@cluster0.ogfbv.mongodb.net/cpquestionsDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const questionSchema = {
  title: String,
  content: String,
  link: String,
  tag: String
};

const Question = mongoose.model("Question", questionSchema);


for (var i = 1; i <= 10; i++) {
  const url = 'https://codeforces.com/problemset/page/' + i;

  rp(url)
    .then(function(html) {
      const dom = parse(html);
      const h1 = dom.querySelectorAll("a");
      // const h1 =$['td[class="dark"] > div[style="float: left"] > a'];
      var m = [];
      var cnt = 0;
      for (var i = 0; i < h1.length; i++) {
        var a = h1[i].text.trim();
        var b = h1[i].getAttribute("href");
        // var k= string(h1[i].href);
        // console.log(a);
        b = b.trim();
        var check = b.substr(1, 19);
        if (check === 'problemset/problem/') {
          let str = b;
          str = str.substr(20);
          let newStr = str.replace('/', '');
          newStr = newStr.replace('/', '');
          if (newStr != a) {
            const item1 = new Question({
              title: newStr,
              content: a,
              link: "https://codeforces.com" + b,
            });
            item1.save();


            const ur = "https://codeforces.com" + h1[i].getAttribute("href");
            rp(ur).then(function(html) {
                const dom = parse(html);
                const h1 = dom.querySelectorAll(".tag-box");
                t = "";
                for (var i = 0; i < h1.length; i++) {
                  t += h1[i].innerText.trim();
                  t += '/';
                  // console.log(h1[i].innerText);
                }
                Question.updateOne({
                  title: newStr
                }, {
                  tag: t
                }, function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    // console.log("Sucess");
                    // console.log(i);
                    // i++;
                  }
                });
              })
              .catch(function(err) {
                //handle error
              });

            cnt++;
            // console.log(b);
            // console.log(a);
          }
        }
      }
      console.log(h1.length);
      console.log(cnt);
    })
    .catch(function(err) {
      //handle error
    });
}


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
