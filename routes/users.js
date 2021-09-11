const express = require('express');
const router = express.Router();
const client = require('../helper/conn');
const auth = require('../helper/authentication-users');

const tablename='users';
//get all users
router.get('/', (req, res)=>{
    //get token    
    if(auth.validateToken(req)){
        client.query("select id,username,isadmin from "+tablename+" where is_deleted=false")
        .then(results => {
            var output={
                status: 200,
                results:results.rows
            }
            res.json(output);
        });
    }else{
        // Access Denied
        res.sendStatus(403);
    }

})

//get single user
router.get('/:id', (req, res)=>{
    if(auth.validateToken(req)){
        client.query("select id,username,isadmin from "+tablename+" WHERE is_deleted=false AND id=$1", [req.params.id])
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
    
})

//insert post user
router.post('/', (req, res)=>{
    if(auth.validateToken(req)){
        var password=auth.getHashPassword(req.body.password);
        client.query("INSERT INTO "+tablename+" (username, salt, password, isAdmin) VALUES ($1, $2, $3, $4)", [req.body.username, password[0], password[1], req.body.admin])
        .then(results => {
            var output={
                status: 400,
                msg:""
            }

            if(results.rowCount > 0){
                output.msg='New user data has been inserted';
                output.status= 201;
            }else{
                output.msg='fail to add data';
            }
            res.json(output);
        });
    }else{
        res.sendStatus(403);
    }
})

// put single user
router.put('/:id', (req, res)=>{
    if(auth.validateToken(req)){
        client.query("select username from "+tablename+" WHERE id=$1", [req.params.id])
        .then(results => {
            if(results.rowCount > 0){
                client.query("update "+tablename+" set username=$1 WHERE id=$2", [req.body.username, req.params.id])
                .then(result=>{
                    if(result.rowCount>0){
                        res.json({
                            status: 200,
                            msg: 'successfully update'
                        })
                    }else{
                        res.json({
                            status: 400,
                            msg: 'fail to update'
                        })
                    }
                })
            }else{
                res.json({
                    status: 400,
                    msg: 'no user with that id'
                })
            }
        });
    }else{
        res.sendStatus(403);
    }
    
})


// //delete single user
router.delete('/:id', (req, res)=>{
    if(auth.validateToken(req)){
        client.query("select is_deleted from "+tablename+" WHERE id=$1", [req.params.id])
        .then(results => {
            if(results.rowCount > 0){
                client.query("update users set is_deleted=true WHERE id=$1", [req.params.id])
                .then(result=>{
                    if(result.rowCount>0){
                        res.json({
                            status: 200,
                            msg: 'user is deleted successfully'
                        })
                    }else{
                        res.json({
                            status: 400,
                            msg: 'fail to delete user'
                        })
                    }
                })
            }else{
                res.json({
                    status: 400,
                    msg: 'no user with that id'
                })
            }
        });
    }else{
        res.sendStatus(403);
    }
})

module.exports = router;