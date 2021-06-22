'use strict'

require('dotenv').config();

const cors = require('cors');
const express = require('express');
const app = express();

// CORS Middleware
app.use(cors());

const bodyParser = require("body-parser");
// Body Parser Middleware
app.use( bodyParser.urlencoded({ extended: true }) );

const multer  = require('multer')
const path = require('path');
const fs = require('fs');

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null, Date.now() + "." + file.mimetype.split('/')[1])
    }
});
  
// Init Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('file');;
  
// Check File Type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(!file){
      cb('Error: No image');
    }
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only');
    }
}

app.post('/upload', (req, res, next) => {
    // upload
    upload(req, res, (err) => {
        if(err){
            return res.status(400).json({status : false, message : err})
        } else {
            if(req.file == undefined){
                return res.status(400).json({status : false, message : "No file selected"})
            } else {
                return res.status(200).json({status : true, message : "File upload", filename : req.file.filename})
            }
        }
    });
})

app.get('/delete/:filename', (req, res, next) => {
    // delete
    const filePath = './public/uploads/' + req.params.filename

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(400).json({status : false, message : "Error while deleting"})
        } else {
            return res.status(200).json({status : true, message : "File deleted"})
        }
    });
})

app.get('/picture/:filename', (req, res, next) => {
    if(!req.params.filename){
        return res.status(404).json({status : false, message : 'Invalid parameters.'});
    }

    const filePath = './public/uploads/' + req.params.filename
    res.sendFile(filePath , { root: "." });
})

// Start server
const server = app.listen(process.env.PORT, (err) => {
    if (err) return err;
    console.log(`Server running at PORT ${process.env.PORT}`);
});
