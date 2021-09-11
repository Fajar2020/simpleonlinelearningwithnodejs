const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const client = require('../helper/conn');
const auth = require('../helper/authentication-users');


const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'upload/thumbnail_course')
    },
    filename: (req, file, cb)=>{
        const img_name=Date.now()+path.extname(file.originalname);
        cb(null, img_name);
        req.body.uploadName='upload/thumbnail_course'+img_name;
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg)$/)) { 
         // upload only png and jpg format
         return cb(new Error('Please upload a Image'))
        }
      cb(undefined, true)
    }
})

const upload=multer({storage:storage})


const tablename='courses';



//get all courses
router.get('/', (req, res)=>{
    if(auth.validateToken(req)){
        var query='SELECT c.name as course_title, c.description as course_description, c.thumbnail as course_thumbnail, t.name as teacher_name, cate.name as category_name, u.username as update_by, c.price as price'
        +' FROM courses c INNER JOIN categories cate ON cate.id = c.category_id INNER JOIN teachers t ON t.id = c.teacher_id INNER JOIN users u ON u.id = c.update_by WHERE 1=1';

        var whereclause='';
        var value=[];
        var counter=0;

        if (req.query.id) {
            whereclause += ' AND c.id = $' + ++counter;
            value.push(req.query.id);
        }

        if (req.query.title) {
            var search = ' AND (';
            search += " c.name ILIKE $" + ++counter;
            search += ')';

            value.push('%'+req.query.title+'%');

            whereclause += search;
        }

        query += whereclause;

        if (req.query.order) {
            if(req.query.order.toLowerCase() === 'free'){
                query += ' AND c.price = $' + ++counter;
                value.push('0');
            }else{
                var order_ = req.query.order.split(",");
                query += ' ORDER by c.' + order_[0] + " " + order_[1];
            }
        } else {
            query += ' ORDER by c.id ';
        }

        client.query(query, value)
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

// get single courses
// router.get('/:id', (req, res)=>{
//     if(auth.validateToken(req)){
//         client.query(`
//         SELECT
//             c.name as course_title,
//             c.description as course_description,
//             c.thumbnail as course_thumbnail,
//             t.name as teacher_name,
//             cate.name as category_name,
//             u.username as update_by
//         FROM
//             courses c
//             INNER JOIN categories cate ON cate.id = c.category_id
//             INNER JOIN teachers t ON t.id = c.teacher_id
//             INNER JOIN users u ON u.id = c.update_by
//         WHERE
//             c.id=$1
//         `, [req.params.id])
//         .then(results => {
//             var output={
//                 status: 200,
//                 results:results.rows
//             }
//             res.json(output);
//         });
//     }else{
//         res.sendStatus(403);
//     }
// })

//insert post courses
router.post('/', upload.single("thumbnail"), (req, res)=>{
    if(auth.validateToken(req)){
        client.query("INSERT INTO "+tablename+" (name, description, thumbnail, teacher_id, category_id, update_at, update_by, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [req.body.name, req.body.description, req.body.uploadName, req.body.teacher_id, req.body.category_id, new Date().toISOString(), req.body.update_by, req.body.price])
        .then(results => {
            var output={
                status: 400,
                msg:""
            }

            if(results.rowCount > 0){
                output.msg='New course data has been inserted';
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

// put single courses
router.put('/:id', upload.single("thumbnail"), (req, res)=>{
    if(auth.validateToken(req)){
        client.query("select * from "+tablename+" WHERE id=$1", [req.params.id])
        .then(results => {
            if(results.rowCount > 0){
                $query="";
                $params=[];
                if(req.body.thumbnail){
                    $query="update "+tablename+" set name=$1, description=$2, thumbnail=$3, teacher_id=$4, category_id=$5, update_at=$6, update_by=$7, price=$8 WHERE id=$9";
                    $params=[req.body.name, req.body.description, req.body.uploadName, req.body.teacher_id, req.body.category_id, new Date().toISOString(), req.body.update_by, req.body.price, req.params.id];
                }else{
                    $query="update "+tablename+" set name=$1, description=$2, teacher_id=$3, category_id=$4,update_at=$5, update_by=$6, price=$7 WHERE id=$8";
                    $params=[req.body.name, req.body.description, req.body.teacher_id, req.body.category_id, new Date().toISOString(), req.body.update_by, req.body.price, req.params.id]
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
    
})


// //delete single courses
router.delete('/:id', (req, res)=>{
    if(auth.validateToken(req)){
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
})

module.exports = router;