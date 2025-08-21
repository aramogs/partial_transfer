let btn_cl_1 = document.getElementById("btn_cl_1")
let btn_cl_2 = document.getElementById("btn_cl_2")
let btn_cl_3 = document.getElementById("btn_cl_3")
let btn_cl_4 = document.getElementById("btn_cl_4")
let btn_cl_5 = document.getElementById("btn_cl_5")

btn_cl_1.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/master_fg_gm")
})

btn_cl_2.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/master_pallet")
})

btn_cl_3.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/master_fg_ford")
})

btn_cl_4.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/master_fg_bmw")
})

btn_cl_5.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/master_fg_lucid")
})