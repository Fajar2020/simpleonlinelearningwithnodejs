const express = require('express');
const router = express.Router();
const client = require('../helper/conn');
const auth = require('../helper/authentication-users');


router.get('/usernonadmin/:id', (req, res)=>{
    // jumlah total user, total course, serta total course yang memiliki harga free

    if(auth.validateToken(req)){
        auth.isUserAdmin(req.params.id).then(results => {
            const user = results.rows;
            if(user && user.length){
                client.query("SELECT COUNT(*) as users_non_admin FROM users WHERE isadmin=false AND is_deleted=false")
                .then(results => {
                    var output={
                        status: 200,
                        results:results.rows
                    }
                    res.json(output);
                });
            }else{
                res.sendStatus(403);
            }
        });

    }else{
        res.sendStatus(403);
    }
    
});


router.get('/useradmin/:id', (req, res)=>{
    // jumlah total user, total course, serta total course yang memiliki harga free
    if(auth.validateToken(req)){
        auth.isUserAdmin(req.params.id).then(results => {
            const user = results.rows;
            if(user && user.length){
                client.query("SELECT COUNT(*) as users_admin FROM users WHERE isadmin=true AND is_deleted=false")
                .then(results => {
                    var output={
                        status: 200,
                        results:results.rows
                    }
                    res.json(output);
                });
            }else{
                res.sendStatus(403);
            }
        });

    }else{
        res.sendStatus(403);
    }
    
    
});


router.get('/totcourse/:id', (req, res)=>{
    // jumlah total user, total course, serta total course yang memiliki harga free

    if(auth.validateToken(req)){
        auth.isUserAdmin(req.params.id).then(results => {
            const user = results.rows;
            if(user && user.length){
                client.query("SELECT COUNT(*) as total_courses FROM courses")
                .then(results => {
                    var output={
                        status: 200,
                        results:results.rows
                    }
                    res.json(output);
                });
            }else{
                res.sendStatus(403);
            }
        });

    }else{
        res.sendStatus(403);
    }

    
});


router.get('/totcoursefree/:id', (req, res)=>{
    // jumlah total user, total course, serta total course yang memiliki harga free

    if(auth.validateToken(req)){
        auth.isUserAdmin(req.params.id).then(results => {
            const user = results.rows;
            if(user && user.length){
                client.query("SELECT COUNT(*) as total_courses FROM courses WHERE price = '0'")
                .then(results => {
                    var output={
                        status: 200,
                        results:results.rows
                    }
                    res.json(output);
                });
            }else{
                res.sendStatus(403);
            }
        });

    }else{
        res.sendStatus(403);
    }
    
});

module.exports = router;
