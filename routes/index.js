var express = require('express');
var router = express.Router();

var levelup = require('level');
var db = levelup('./quizzes.db');

var bodyParser = require('body-parser');

var QUIZ_ROUTE = '/quizzes';

var QUIZ_NAME_KEY = 'quizName';
var TABLE_KEY = 'table';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('quiz', { tableHeader : '↖ Select a file!', tableData : '' });
});

router.post(QUIZ_ROUTE, function(req, res, next) {
    var id = req.body[QUIZ_NAME_KEY];
    // replace invalid url chars    
    id = id.replace(/[^a-zA-Z0-9-_]/g, '');
    
    var toStore = JSON.stringify(req.body);
    db.put(id, toStore, function(err) {
        if(err) return console.log('Error putting ' + id, err);
        
        console.log("successfully stored " + id);
        var newUrl = QUIZ_ROUTE + '/' + id;
        res.status(201).send({ redirect : newUrl });
    });
});

router.get(QUIZ_ROUTE + '/:quizName', function(req, res, next) {
    var quizName = req.params.quizName;    
    console.log('get quiz with id ' + quizName);
    
    db.get(quizName, function(err, value) {
        if(err) {
            console.log(err);
            return res.send("Sorry! There's no quiz named " + req.params.quizName + "." +
                                '<br><a href="/">Go back home</a>');
        }
        
        // Turn the stored string back into json, and get the data from it
        var quizJson = JSON.parse(value);
        var quizName = quizJson[QUIZ_NAME_KEY];
        var tableHtml = quizJson[TABLE_KEY];
        
        // Render the page, replace the table with the one we've retrieved
        // and sent it to the client
        return res.render('saved-quiz', { tableHeader : quizName, tableData : tableHtml });        
    });
});

module.exports = router;
