'use strict';

console.log('Hello world');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');

const listen_port = 443

// Import the express module
const express = require("express");

const success_token = `{
            "access_token": "eyJ0eXAiOiJhdCtqd3QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImJlcGpHV0dkOW44WU9VQ1Nw",
                "refresh_token": "aa957c85-f1f2-453d-8211-adbbb30b8428",
                "expires_in": "600",
                "scope": "trapi.data.pricing.read trapi.streaming.pricing.read",
                "token_type": "Bearer"
        }`

const success_token_v2 = `{
                   "access_token": "eyJ0eXAiOiJhdCtqd3QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImJlcGpHV0dkOW44WU9VQ1Nw",
                 "expires_in": "7199",
                "scope": "trapi.data.pricing.read trapi.streaming.pricing.read", 
                 "token_type": "Bearer"
        }`

const bad_request_token = '{"error": "invalid_grant"}'

const endpoints_data = fs.readFileSync('endpoints.json', 'utf8');

function timestamp() {
    // current timestamp in milliseconds
    const timestamp = Date.now();

    const dateObject = new Date(timestamp);   

    // current hours
    const hours = dateObject.getHours();

    // current minutes
    const minutes = dateObject.getMinutes();

    // current seconds
    const seconds = dateObject.getSeconds();

    return`[${hours}:${minutes}:${seconds}] `

}

// Instantiate an Express application
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
// Create a NodeJS HTTPS listener on port 8000 that points to the Express app
// Use a callback function to tell when the server is created.
https.createServer(
        // Provide the private and public key to the server by reading each
        // file's content with the readFileSync() method.
        {
            key: fs.readFileSync("key.pem"),
            cert: fs.readFileSync("cert.pem"),
        },
        app
    )
    .listen(listen_port, () => {
       
        console.log(timestamp() + "server is runing at port " + listen_port);
    });

// Create an try point route for the Express app listening on port 443.
// This code tells the service to listed to any request coming to the / route.
// Once the request is received, it will display a message "Hello from express server."
app.get('/', (req, res) => {
    res.send("Hello from express server.")
})

app.post('/auth/oauth2/v1/token', (req, res) => {
    
    console.log(timestamp()+req.url)
    console.log("grant_type: "+req.body.grant_type)
    if (req.body.grant_type == 'password') {
        res.send(success_token)

    } else if (req.body.grant_type == 'refresh_token') { 
        res.send(success_token)
        //console.log("Send 400 Bad Request")
        //res.status(400).send(bad_request_token)
    } else {
        console.log("Unknown grant_type")
        res.status(400).send(bad_request_token)
    }



})

app.post('/auth/oauth2/v2/token', (req, res) => {

    console.log(timestamp() + req.url)
    console.log(req.body)
    console.log("grant_type: " + req.body.grant_type)
    if (req.body.grant_type == 'client_credentials') {
        res.send(success_token_v2)

    } else {
        console.log("Unknown grant_type")
        res.status(400).send(bad_request_token)
    }



})

app.get('/streaming/pricing/v1/', (req, res) => {
    console.log(timestamp()+req.url)
    res.send(endpoints_data)
})
