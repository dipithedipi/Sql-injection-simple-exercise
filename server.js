const { createDbConnection, execQuery } = require('./db.js');
const express =  require('express')
const http = require('http');
const path = require('path');

const app = express()
app.use(express.json());
app.use(express.static("webUI"));

const db = createDbConnection()
if (db) {
    console.log('[+] Database opened')
} else {
    console.log('[!] Error opening database')
    process.exit(1)
}

// API to handle login requests
levels = [
    {
        title: "Level 0: Find a way to login as admin",
        filters: []
    },
    {
        title: "Level 1: Find a way to leak the admin credentials",
        filters: ["OR"], 
    },
    {
        title: "Level 2: Find a way to leak the admin credentials",
        filters: [" ", "OR", "AND", "LIKE", "=", "--", "<", ">", "#", "admin"]
    },
    {
        title: "Level 3: Find a way to leak the admin credentials",
        filters: [" ", "OR", "AND", "LIKE", "=", "--", "<", ">", "#", "admin", "user", "test", "union"]
    },
]

function randomPassword() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }
    return password;
}

app.get('/login/lvl/:value/info', (req, res) => {
    const { value } = req.params
    res.send(JSON.stringify(levels[value]))
})

app.post('/login/lvl/:value', (req, res) => {
    let { value } = req.params
    let { username, password } = req.body
    // console.log("before filetering")
    // console.log("username:", username, "password:", password)
    
    // Define filters as regex patterns
    const filters = levels[value].filters.join('|');
    const regex = new RegExp(filters, 'gi'); // 'gi' for global and case-insensitive matching

    // Filter username and password using regex
    username = username.replace(regex, '');
    password = password.replace(regex, '');

    // console.log("after filetering")
    // console.log("username:", username, "password:", password)

    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`
    
    execQuery(db, query, (error, rows) => {
        if (error) {
            console.error("[!] Error executing query:", error);
            res.statusCode = 500
            res.send(
                JSON.stringify({
                    message: `Query error: (${error})`,
                    query: query,
                    result: [],
                })
            )
        } else if ( rows.length == 1 && rows[0].Id == 1 ) {
            execQuery(db, `UPDATE users SET password = '${randomPassword()}' WHERE username = 'admin';`, (error) => {
                if (error) {
                    console.log("[!] error updating password")
                } else {
                    console.log("[+] level complete")
                }  
            })

            

            req.statusCode = 200
            res.send(
                JSON.stringify({
                    message: "Successfully find admin credentials",
                    query: query,
                    result: rows
                })
            )
        } else {
            console.log("Query results:", rows);
            req.statusCode = 200
            res.send(
                JSON.stringify({
                    message: "Failed to login",
                    query: query,
                    result: rows
                })
            )
        }
    })
})

// default URL for website
app.use('/', function(req,res){
    if (req.url === '/') {
        res.sendFile(path.join(__dirname+'/webUI/index.html'));
    }
});

const server = http.createServer(app);
server.listen(3000, () => {
    console.log(`[+] Server listening on port 3000`)
})
