const textslide=document.getElementById('text-slider');

let text=["Hello","Bonjour","नमस्ते","Hola","Halo","Hei","Ciao"];
let textfont=["'Courier New', Courier, monospace","italic","Cambria, Cochin, Georgia, Times, 'Times New Roman', serif","fantasy","cursive","akronim","sans-serif"];
let c=0;
textslide.style.color="yellow";
setInterval(changeText,1000);
function changeText(){
    textslide.innerHTML=text[c];
    textslide.style.fontFamily=textfont[c];
    c++;
    if(c>=text.length){
        c=0;
    }    
}
