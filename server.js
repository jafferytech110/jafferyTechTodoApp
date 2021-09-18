let express = require("express");
let mongodb = require("mongodb").MongoClient;
let sanitizeHTML = require("sanitize-html");

let ObjectId = require("mongodb").ObjectId;
let app = express();

let db;

//that is for heroku port
let port = process.env.PORT;
if (port == null || "") {
  port = 3000;
}

//for browser.js
app.use(express.static("public"));

let connectionString =
  "mongodb+srv://jafferyTech110:xGzSOuNAFCGJOluH@cluster0.ocmuz.mongodb.net/TodoApp?retryWrites=true&w=majority";

mongodb.connect(connectionString, { useNewUrlParser: true }, (err, client) => {
  if (err) {
    console.log("unable to connect", err);
  } else {
    db = client.db();
    app.listen(port);
  }
});

// for asynchronous request
app.use(express.json());
//including body object on request object in order to access form data
app.use(express.urlencoded({ extended: false }));

function passwordProtected(req, res, next) {
  //
  res.set("WWW-Authenticate", 'Basic realm="Simple todo App"');
  console.log(req.headers.authorization);
  //userName = jaffery and password = W0rld@110
  if (req.headers.authorization == "Basic amFmZmVyeTpXMHJsZEAxMTA=") {
    //next() means this func is done now go to the next argument
    next();
  } else {
    res.status(401).send("Authoentication Required");
  }
}

//use this function for all route
app.use(passwordProtected);
//multiple functions can be provided here, functions inside parameters will be called one by one
app.get("/", (req, res) => {
  db.collection("items")
    .find()
    .toArray((err, items) => {
      res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link
            rel="stylesheet"
            href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css"
            integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS"
            crossorigin="anonymous"
          />
          <title>To Do App</title>
        </head>
        <body>
          <div class="container">
            <h1 class="display-4 text-center py-1">To-Do App</h1>
      
            <div class="jumbotron p-3 shadow-sm">
              <form id ="create-form" action="/create-item" method="POST">
                <div class="d-flex align-items-center">
                  <input
                      id = "create-field"
                      name="item"
                    autofocus
                    autocomplete="off"
                    class="form-control mr-3"
                    type="text"
                    style="flex: 1"
                  />
                  <button class="btn btn-primary">Add New Item</button>
                </div>
              </form>
            </div>
      
            <ul class="list-group pb-5" id="item-list">
        
            </ul>
          </div>
          <!--Javascript for updating and editing items -->
          <script>
          let items = ${JSON.stringify(items)}</script>
          <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
          <script src="/browser.js">              
          </script>
        </body>
      </html>
      `);
    });
});

app.post("/create-item", (req, res) => {
  //this db.collection('items') will select item collection from dataBase
  //inserOne CRUD C here, once item created then then function runs
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  db.collection("items").insertOne({ text: safeText }, (err, info) => {
    //info.ops has a new created js object
    if (err) {
      console.log("Error occured while inserting data");
    } else {
      let data = {
        _id: info.insertedId,
        text: req.body.text,
      };
      res.json(data);
    }
  });
});

app.post("/update-item", (req, res) => {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  db.collection("items").findOneAndUpdate(
    { _id: new ObjectId(req.body.id) },
    { $set: { text: safeText } },
    () => {
      res.send("success");
    }
  );
});

app.post("/delete-item", (req, res) => {
  db.collection("items").deleteOne({ _id: new ObjectId(req.body.id) }, () => {
    res.send("success");
  });
});
