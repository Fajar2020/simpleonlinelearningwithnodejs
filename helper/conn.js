const Client = require('pg').Client;
const client = new Client({
    user:'',    //db username
    password:'',//db password
    port:5432,  //commont port for pg
    database:'' //db name
})


client.connect()
    .then(()=>console.log('connect to pg'))
    .catch(e=>console.log(e));

module.exports=client;