const express = require('express');
const app = express();
const auth = require('./helper/authentication-users');


app.use(express.json());
app.use(express.urlencoded({extended:false}))


app.post('/login',(req, res) => {  
    auth.getUser(req.body.username).then(results => {
        const user = results.rows;
        if(user && user.length){
            auth.checkUsers({
                password:req.body.password,
                salt:user[0].salt,
                hashPassword: user[0].password
            }, res);
        }else{
            res.sendStatus(403);
        }
    });
      
}); 
app.use('/users', require('./routes/users'));
app.use('/teachers', require('./routes/teachers'));
app.use('/courses', require('./routes/courses'));
app.use('/resources', require('./routes/resources'));
app.use('/categories', require('./routes/categories'));
app.use('/simplestatic', require('./routes/simplestatic'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server started on port ${PORT}`));