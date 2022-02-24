let socket = io();

window.addEventListener("load", (event) => {
    let svg = document.querySelector(".svgClass").getSVGDocument()

    socket.on('posses-change', (arg) => {
        console.log(arg)
    });  
})
