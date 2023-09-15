const ipfsClient = require("ipfs-http-client");
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const fs = require("fs");

const ipfs = ipfsClient.create({
  host: "localhost",
  port: "5001",
  protocol: "http",
});

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.get("/upload", (req, res) => {
  res.render("home");
});

app.post("/upload/upload-file", (req, res) => {
  const file = req.files.file;
  const fileName = req.body.fileName;
  const filePath = "files/" + fileName;

  file.mv(filePath, async (err) => {
    if (err) {
      console.log("Error: failed to download the file");
      return res.status(500).send(err);
    }

    const fileHash = await addFile(fileName, filePath);
    fs.unlink(filePath, (err) => {
      if (err) console.log(err);
    });

    console.log("fileHash", fileHash);

    // res.render("upload", { fileName, fileHash });
    // res.send(fileHash);.
    // res.render("home", { fileHash });
    const jsonResponse = { hash: fileHash };

    console.log("jsonResponse", jsonResponse);
    res.json(jsonResponse);
  });
});

const addFile = async (fileName, filePath) => {
  console.log("addFile");
  const file = fs.readFileSync(filePath);
  const fileAdded = await ipfs.add({ path: fileName, content: file });
  console.log(fileAdded, "fileAdded");
  const fileHash = fileAdded.cid.toString();
  console.log(fileHash);
  return fileHash;
};

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
