let value = false
let serial_num = document.getElementById("serial_num")
let alerta_prefijo = document.getElementById("alerta_prefijo")
let submitSerial = document.getElementById("submitSerial")


let submitCantidad = document.getElementById("submitCantidad")
let cantidadSubmit = document.getElementById("cantidadSubmit")
let alerta_cantidad = document.getElementById("alerta_cantidad")
let Bserial = document.getElementById("Bserial")
let Bmaterial = document.getElementById("Bmaterial")
let Bstock = document.getElementById("Bstock")
let Bdescription = document.getElementById("Bdescription")
let Bweigth = document.getElementById("Bweigth")


let errorText = document.getElementById("errorText")
let btnCerrar = document.querySelectorAll(".btnCerrar")

let successText = document.getElementById("successText")
let btnTransferir = document.getElementById("btnTransferir")
let user_id = document.getElementById("user_id")

let tabla_consulta = document.getElementById('tabla_consulta').getElementsByTagName('tbody')[0];

serial_num.focus()

btnCerrar.forEach(element => {
    element.addEventListener("click", cleanInput)
});

serial_num.addEventListener("keyup", check_qualifier)


submitSerial.addEventListener("submit", (e)=>{process_input(e)})


function process_input(e) {
    e.preventDefault()
    serial_mandrel = serial_num.value

    if (serial_mandrel.charAt(0).toUpperCase() === "M") {

        if (serial_mandrel.length > 5) {
            $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
            serial_num.disabled = true
            let data = { "proceso": "transfer_ext_mandrel", "mandrel": `${serial_mandrel.substring(1)}`, "user_id": user_id.innerHTML };
            axios({
                method: 'post',
                url: "/getUbicacionesEXTMandrel",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data)
            })
                .then((result) => {
                    if ((result.data).includes("<!DOCTYPE html>")) {

                        setTimeout(() => {
                            location.href = "/login"
                        }, 1000);
                        soundWrong()
                    }

                    let response = JSON.parse(result.data)

                    if (response.error !== "N/A") {
                        soundWrong()
                        errorText.innerHTML = response.error
                        setTimeout(() => { $('#modalSpinner').modal('hide') }, 500);
                        $('#modalError').modal({ backdrop: 'static', keyboard: false })
                    } else {

                        let storage_bins = []
                        let arregloFinal = []
                        tabla_consulta.innerHTML = ""
                        soundOk()
                        let result = response.result

                        for (let i = 0; i < result.length; i++) {
                            if (storage_bins.indexOf(result[i].storage_bin) === -1) {
                                storage_bins.push(`${result[i].storage_bin}`)
                            }
                        }


                        for (let i = 0; i < storage_bins.length; i++) {
                            let count = 0
                            let recentDate = ""
                            for (let y = 0; y < result.length; y++) {
                                if (storage_bins[i] == result[y].storage_bin) {
                                    count++
                                    if (recentDate < result[y].gr_date) {
                                        recentDate = result[y].gr_date
                                    }
                                }
                            }
                            let push = { "storage_bin": `${storage_bins[i]}`, "count": `${count}`, "recentDate": `${recentDate}` }
                            arregloFinal.push(push)

                        }

                        const arregloFinalSortDate = arregloFinal.sort((a, b) => b.recentDate - a.recentDate)
                        arregloFinalSortDate.forEach(element => {
                            row = `
                            <tr>
                                <td>${element.storage_bin}</td>
                                <td>${element.count}</td>
                                <td>${element.recentDate}</td>
                            </tr>
                            `

                            let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                            return newRow.innerHTML = row;
                        });

                        $('#modalSpinner').modal('hide')
                        $('#myModal').modal({ backdrop: 'static', keyboard: false })

                    }

                })
                .catch((err) => { console.error(err) })
        } else {
            soundWrong()
            alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
            serial_num.value = ""
        }

    } else if (serial_mandrel.charAt(0).toUpperCase() === "S") {
        
        if (serial_mandrel.length > 8) {
            $('#modalSpinner').modal({ backdrop: 'static', keyboard: false })
            serial_num.disabled = true


            let data = { "proceso": "transfer_ext_serial", "serial": `${serial_mandrel.substring(1)}`, "user_id": user_id.innerHTML, "storage_type": `` };
            axios({
                method: 'post',
                url: "/getUbicacionesEXTSerial",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data)
            })
                .then((result) => {
                    if ((result.data).includes("<!DOCTYPE html>")) {

                        setTimeout(() => {
                            location.href = "/login"
                        }, 1000);
                        soundWrong()
                    }

                    let response = JSON.parse(result.data)

                    if (response.error !== "N/A") {
                        soundWrong()
                        errorText.innerHTML = response.error
                        setTimeout(() => { $('#modalSpinner').modal('hide') }, 500);
                        $('#modalError').modal({ backdrop: 'static', keyboard: false })
                    } else {

                        let storage_bins = []
                        let arregloFinal = []
                        tabla_consulta.innerHTML = ""
                        soundOk()
                        let result = response.result

                        for (let i = 0; i < result.length; i++) {
                            if (storage_bins.indexOf(result[i].storage_bin) === -1) {
                                storage_bins.push(`${result[i].storage_bin}`)
                            }
                        }


                        for (let i = 0; i < storage_bins.length; i++) {
                            let count = 0
                            let recentDate = ""
                            for (let y = 0; y < result.length; y++) {
                                if (storage_bins[i] == result[y].storage_bin) {
                                    count++
                                    if (recentDate < result[y].gr_date) {
                                        recentDate = result[y].gr_date
                                    }
                                }
                            }
                            let push = { "storage_bin": `${storage_bins[i]}`, "count": `${count}`, "recentDate": `${recentDate}` }
                            arregloFinal.push(push)

                        }

                        const arregloFinalSortDate = arregloFinal.sort((a, b) => b.recentDate - a.recentDate)
                        arregloFinalSortDate.forEach(element => {
                            row = `
                            <tr>
                                <td>${element.storage_bin}</td>
                                <td>${element.count}</td>
                                <td>${element.recentDate}</td>
                            </tr>
                            `

                            let newRow = tabla_consulta.insertRow(tabla_consulta.rows.length);
                            return newRow.innerHTML = row;
                        });

                        $('#modalSpinner').modal('hide')
                        $('#myModal').modal({ backdrop: 'static', keyboard: false })

                    }

                })
                .catch((err) => { console.error(err) })
        } else {
            soundWrong()
            alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
            alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
            serial_num.value = ""
        }
    }

}



function check_qualifier() {
    serial_mandrel = serial_num.value;
    if (String(serial_mandrel.charAt(0)) !== "s" && String(serial_mandrel.charAt(0)) !== "S" && String(serial_mandrel.charAt(0)) !== "m" && String(serial_mandrel.charAt(0)) !== "M") {
        soundWrong()
        alerta_prefijo.classList.remove("animate__flipOutX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipInX", "animate__animated")
        serial_num.value = ""
    } else {
        value = true
        alerta_prefijo.classList.remove("animate__flipInX", "animate__animated")
        alerta_prefijo.classList.add("animate__flipOutX", "animate__animated")
    }
}

function cleanInput() {
    serial_num.disabled = false
    serial_num.value = ""
    value = false
}