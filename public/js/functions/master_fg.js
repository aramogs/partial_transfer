let btn_cl_1 = document.getElementById("btn_cl_1")
let btn_cl_2 = document.getElementById("btn_cl_2")
let btn_cl_3 = document.getElementById("btn_cl_3")



btn_cl_1.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/master_fg_gm")
})

btn_cl_2.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/master_pallet")
})

btn_cl_3.addEventListener("click",()=>{
    window.location.replace(window.location.origin + "/master_fg_ford")
})