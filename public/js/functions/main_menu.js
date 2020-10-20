let btn_pt_1 = document.getElementById("btn_pt_1")
let btn_pt_2 = document.getElementById("btn_pt_2")
let btn_mp_1 = document.getElementById("btn_mp_1")

btn_pt_1.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/consultaFG")
})

btn_pt_2.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/transferFG")
})

btn_mp_1.addEventListener("click", ()=>{
    window.location.replace(window.location.origin + "/movimiento_parcial")
})

