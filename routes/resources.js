const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const client = require('../helper/conn');
const auth = require('../helper/authentication-users');


const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'upload/file')
    },
    filename: (req, file, cb)=>{
        const img_name=Date.now()+path.extname(file.originalname);
        cb(null, img_name);
        req.body.uploadName='upload/file'+img_name;
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(pdf)$/)) { 
         // upload only png and jpg format
         return cb(new Error('Please upload a pdf'))
        }
      cb(undefined, true)
    }
})

const upload=multer({storage:storage})


const tablename='resources';
//get all resources
router.get('/', (req, res)=>{
    if(auth.validateToken(req)){
        client.query(`
        SELECT
            c.name as course_title,
            r.title as resources_title,
            r.description as resources_description,
            r.file_resource as file_resource,
            u.username as update_by
        FROM
            resources r
            INNER JOIN courses c ON c.id = c.course_id
            INNER JOIN users u ON u.id = u.update_by
        `)
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

//get single courses with detail resources
router.get('/:id', (req, res)=>{
    if(auth.validateToken(req)){
        client.query(`
        SELECT
            c.name as course_title, 
            c.description as course_description, 
            c.thumbnail as course_thumbnail, 
            c.price as price
            r.title as resources_title,
            r.description as resources_description,
            r.file_resource as file_resource,
            r.queue as resources_queue,
            u.username as update_by
        FROM
            resources r
            INNER JOIN courses c ON c.id = c.course_id
            INNER JOIN users u ON u.id = u.update_by
        WHERE
            r.id=$1
        ORDER BY r.queue asc
        `, [req.params.id])
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

//insert post resources
router.post('/', upload.single("file"), (req, res)=>{
    if(auth.validateToken(req)){
        auth.isUserAdmin(req.body.update_by).then(results => {
            const user = results.rows;
            if(user && user.length){
                client.query("INSERT INTO "+tablename+" (course_id, title, description, file_resource, queue, update_at, update_by) VALUES ($1, $2, $3, $4, $5, $6, $7)", [req.body.course_id, req.body.title, req.body.description, req.body.uploadName, req.body.queue, new Date().toISOString(), req.body.update_by])
                .then(results => {
                    var output={
                        status: 400,
                        msg:""
                    }

                    if(results.rowCount > 0){
                        output.msg='New resource data has been inserted';
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

// put single resources
router.put('/:id', upload.single("thumbnail"), (req, res)=>{
    if(auth.validateToken(req)){
        auth.isUserAdmin(req.body.update_by).then(results => {
            const user = results.rows;
            if(user && user.length){
                client.query("select * from "+tablename+" WHERE id=$1", [req.params.id])
                .then(results => {
                    if(results.rowCount > 0){
                        $query="";
                        $params=[];
                        if(req.body.thumbnail){
                            $query="update "+tablename+" set course_id=$1, title=$2, description=$3, file_resource=$4, queue=$5, update_at=$6, update_by=$7 WHERE id=$8";
                            $params=[req.body.course_id, req.body.title, req.body.description, req.body.uploadName, req.body.queue, new Date().toISOString(), req.body.update_by, req.params.id];
                        }else{
                            $query="update "+tablename+" set course_id=$1, title=$2, description=$3, queue=$4, update_at=$5, update_by=$6 WHERE id=$7";
                            $params=[req.body.course_id, req.body.title, req.body.description, req.body.queue, new Date().toISOString(), req.body.update_by, req.params.id];
                        }
                        client.query($query, $params)
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


// //delete single resources
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