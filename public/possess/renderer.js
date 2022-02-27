let socket = io();

window.addEventListener("load", (event) => {
    let svg = document.querySelector(".svgClass").getSVGDocument()

    const blue = document.getElementsByClassName('blue')

    const orange = document.getElementsByClassName('orange')

    socket.on('players', (arg) => {
        for(let x =0; x<orange.length; x++) {
            if(arg.orange[x] !== undefined) {
                orange[x].id = arg.orange[x]
                orange[x].innerHTML = arg.orange[x]
            }
        }
    
        for(let i =0; i<blue.length; i++) {
            if(arg.blue[i] !== undefined) {
                blue[i].id = arg.blue[i]
                blue[i].innerHTML = arg.blue[i]
            }
        }
    });

    socket.on('posses-change', (arg) => {
        console.log(arg)
    });  



    socket.emit('get-players')
})
