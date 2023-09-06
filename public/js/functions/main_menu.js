let btn_pt_1 = document.getElementById("btn_pt_1")
let btn_pt_2 = document.getElementById("btn_pt_2")
let btn_pt_3 = document.getElementById("btn_pt_3")
let btn_pt_4 = document.getElementById("btn_pt_4")
let btn_pt_5 = document.getElementById("btn_pt_5")
let btn_mp_1 = document.getElementById("btn_mp_1")
let btn_mp_2 = document.getElementById("btn_mp_2")
let btn_mp_3 = document.getElementById("btn_mp_3")
let btn_mp_4 = document.getElementById("btn_mp_4")
let btn_cc_1 = document.getElementById("btn_cc_1")
let btn_logoff = document.getElementById("btn_logoff")

btn_pt_1.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/consultaFG")
})

btn_pt_2.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/transferFG")
})

btn_pt_3.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/masterFG")
})

btn_pt_4.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/consultaFG2")
})

btn_pt_5.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/verificarAcreditacionFG")
})

btn_mp_1.addEventListener("click", ()=>{
    window.location.replace(window.location.origin + "/movimiento_parcial")
})

btn_mp_2.addEventListener("click", ()=>{
    window.location.replace(window.location.origin + "/transferMP")
})

btn_mp_3.addEventListener("click", ()=>{
    window.location.replace(window.location.origin + "/transfer_MP_FIFO")
})

btn_mp_4.addEventListener("click", ()=>{
    window.location.replace(window.location.origin + "/consultaMP")
})

btn_cc_1.addEventListener("click", ()=>{
    window.location.replace(window.location.origin + "/conteo_ciclico")
})

btn_logoff.addEventListener("click",()=>{ document.cookie = "accessToken" + '=; Max-Age=0', location.reload()})
