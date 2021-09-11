const express = require('express');
const router = express.Router();
const client = require('../helper/conn');
const auth = require('../helper/authentication-users');

const tablename='teachers';
//get all teachers
router.get('/', (req, res)=>{
    //get token    
    if(auth.validateToken(req)){
        client.query("select * from "+tablename)
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

//get single teachers
router.get('/:id', (req, res)=>{
    if(auth.validateToken(req)){
        client.query("select * from "+tablename+" WHERE id=$1", [req.params.id])
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

//insert post teachers
router.post('/', (req, res)=>{
    if(auth.validateToken(req)){

        auth.isUserAdmin(req.body.update_by).then(results => {
            const user = results.rows;
            if(user && user.length){
                client.query("INSERT INTO "+tablename+" (name, update_at, update_by) VALUES ($1, $2, $3)", [req.body.name, new Date().toISOString(), req.body.update_by])
                .then(results => {
                    var output={
                        status: 400,
                        msg:""
                    }
        
                    if(results.rowCount > 0){
                        output.msg='New teacher data has been inserted';
                        output.status= 201;
                    }else{
                        output.msg='fail to add data';
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
})

// put single teachers
router.put('/:id', (req, res)=>{
    if(auth.validateToken(req)){
        auth.isUserAdmin(req.body.update_by).then(results => {
            const user = results.rows;
            if(user && user.length){
                client.query("select * from "+tablename+" WHERE id=$1", [req.params.id])
                .then(results => {
                    if(results.rowCount > 0){
                        client.query("update "+tablename+" set name=$1, update_at=$2, update_by=$3 WHERE id=$4", [req.body.name, new Date().toISOString(), req.body.update_by, req.params.id])
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
                            msg: 'no data with that id'
                        })
                    }
                });
            }else{
                res.sendStatus(403);
            }
        });
        
    }else{
        res.sendStatus(403);
    }
    
})


// //delete single teachers
router.delete('/:id', (req, res)=>{
    if(auth.validateToken(req)){
        auth.isUserAdmin(req.body.update_by).then(results => {
            const user = results.rows;
            if(user && user.length){
                client.query("DELETE FROM "+tablename+" WHERE id=$1", [req.params.id])
                .then(results => {
                    if(results.rowCount>0){
                        res.json({
                            status: 200,
                            msg: 'successfully delete'
                        })
                    }else{
                        res.json({
                            status: 400,
                            msg: 'fail to delete'
                        })
                    }
                });
            }else{
                res.sendStatus(403);
            }
        });
    }else{
        res.sendStatus(403);
    }
})

module.exports = router;