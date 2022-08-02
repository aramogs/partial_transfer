let inputPassword = document.getElementById("inputPassword")
let submitPassword = document.getElementById("submitPassword")

inputPassword.focus()

submitPassword.addEventListener("submit", (e) => {
    e.preventDefault()


    let inputPass = inputPassword.value
    if (inputPass.length > 6) {
        pass = inputPass.charAt(2) == 0 ? pass = inputPass.substring(3,8) : pass = inputPass.substring(2, 8)
    } else {
        pass = inputPass
    }

    axios.post("/userAccess", {
        user: pass
    })
        .then((result) => {
            let response = result.data
            if (response != "unathorized") {
                soundOk()
                setTimeout(() => {
                    window.location.replace(document.referrer)     
                }, 200);
                
            } else {
                soundWrong()
                inputPassword.value=""
                alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
                alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
                setTimeout(() => {
                    alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
                    alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
                }, 2000);
            }
        })
        .catch((err) => { console.error(err) })
})
