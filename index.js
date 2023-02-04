const express = require('express')
const mysql = require('mysql')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const ejs  = require('ejs')
const fs = require('fs')
const multer = require('multer')


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(bodyParser.urlencoded({ extended : true}))

app.get('/', (req, res) => {
    res.render('node.ejs')
})
app.get('/login', (req, res) => {
   res.render('login.ejs')
})//renders an html file


// Connecting the database to the nodejs
const conn = mysql.createPool({
    host: '127.0.0.1',//host ipaddress
    user: 'root',// username
    password: '',//none
    database: 'SolDb'
})

const upload = multer({ dest : 'uploads/'})

app.post('/form', upload.single('image'),(req, res) => {
    const username = req.body.username
    const email  = req.body.email
    const password = req.body.password
    const image = fs.readFileSync(req.file.path)
    
    conn.query(`INSERT INTO userinfo(username, email, password, image) values (?, ?, ?, ?) `, [username, email, password, image], (err) => {
        if (err) throw err;
        console.log("Data inserted successfully")
        fs.unlinkSync(req.file.path)
        res.redirect('/login')
    })
})
app.post('/profile', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    conn.getConnection((error , conn) => {
        if (error) throw error
        const query = `select * from userinfo where username = ? and password = ?`
        conn.query(query, [username, password], (err, result) => {
            if (err) throw err;
            const user = result[0]
            const base64Image = Buffer.from(user.image, 'binary').toString('base64')
            res.render('profile.ejs', {user: user, image: base64Image})
        } )
    })
})

app.listen(1980)