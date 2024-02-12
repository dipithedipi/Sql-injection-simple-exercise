"use strict";

function getLevelInfo(level) {
    level = document.getElementById("level-input").value
    fetch(`/login/lvl/${level}/info`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("level-title").innerText = data.title
            document.getElementById("query-filters").innerText = data.filters
        })
}
getLevelInfo()

async function sendLoginRequest(username, password, level) {
    const response = await fetch(`/login/lvl/${level}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    const data = await response.json()
    return data
}

document.getElementById('level-input').addEventListener('change', function (event) {
    getLevelInfo()
})

document.getElementById('submit-btn').addEventListener('click', async function (event) {
    event.preventDefault()

    let username = document.getElementById("username-input").value
    let password = document.getElementById("password-input").value
    let level = document.getElementById("level-input").value
    console.log(`username: ${username}, password: ${password}, level: ${level}`)

    
    let data = await sendLoginRequest(username, password, level)
    document.getElementById("status-value").innerText = data.message
    document.getElementById("query-executed").innerText = data.query
    document.getElementById("query-result").innerText = JSON.stringify(data.result)

    console.log(data.query)
    console.log(data.result)

    if (data.message.includes("Successfully") && level < 3) {
        document.getElementById("level-input").value = parseInt(level) + 1;
        getLevelInfo()
    }

})
