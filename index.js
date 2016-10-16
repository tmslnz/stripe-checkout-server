var config = {
    SECRET: process.env.SECRET,
    PUBLISHABLE: process.env.PUBLISHABLE,
    APP_DOMAIN: process.env.APP_DOMAIN || 'localhost:5000',
    PORT: process.env.PORT || 5000,
    TEST: false,
};
try {
    Object.assign( config, require('./config.json') );
} catch (err) {
    console.error('./config.json not found');
}

const express = require('express');
const stripe = require('stripe')(config.SECRET);
const bodyParser = require('body-parser');
const path = require('path');
const numeral = require('numeral');
const querystring = require('querystring');

var app = express();

app.set('port', (config.PORT));
if (!config.TEST) app.use(forceSSL);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// Routes
//
app.get('/', function(req, res) {
    res.render('index');
});

app.get('/terms', function(req, res) {
    res.render('terms');
});

app.post('/result', function(req, res, next) {
    var requiredQuery = validateChargeQuery( req );
    if (!requiredQuery) {
        return next('Missing required query params');
    }
    stripe.charges.create({
        amount: requiredQuery.amount,
        currency: 'GBP',
        source: req.body.stripeToken,
        description: 'This will appear in Stripe and email receipts',
        receipt_email: req.body.stripeEmail,
    }, function(err, charge) {
        if (err) {
            console.log(err);
            return next(err);
        }
        res.render('result', makeLocals( {
            message: 'Payment received, thank you.',
            charge: charge,
        } ));
    });
});

app.get('/pay/:amount?', function(req, res, next) {
    var amount = validateAmount( req.params.amount || req.query.amount || req.body.amount );
    if (!amount) {
        return next(new Error('Invalid amount'));
    }
    res.render('pay', makeLocals( {
        amount: amount,
        key: config.PUBLISHABLE,
    } ));
});


// Start
//
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});


// Utils
//
function validateChargeQuery (req) {
    if (req.body.amount) {
        return {
            amount: req.body.amount,
        };
    }
}

function validateAmount (amount) {
    var re = new RegExp('^[0-9.,]+$', 'gi');
    if (!re.test(amount)) {
        return;
    }
    var parsed = numeral().unformat(amount);
    return parsed * 100;
}

function forceSSL (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
}

function makeLocals (obj) {
    return Object.assign({
        qs: querystring,
        numeral: numeral,
    }, obj);
}

app.use(errorHandler);
function errorHandler(err, req, res, next) {
  res.status(err.statusCode || 500);
  res.render('error', { error: err });
}