
//==============================================================================================================
const template = document.createElement("template");
template.innerHTML=`
    <style>
    #numInp{
    color: dodgerblue;
    }
    form{
    display: flex;
    justify-content: center;
    margin: 2rem;
    padding: 1rem;
    }
    #divsdr{
    display: flex;
    justify-content: center;
    color: white;
    font-weight: bolder;
    background-color: dodgerblue;
    border-radius: 10px;
    
    }
    .my-input{
        border: 1px solid black;
        border-radius: 5rem;
        width: 69%;
        margin: 0 auto;
    }
    p{
   font-weight: bold;
    }
    </style>
    <div class="my-input">
        <form>
            <div>
                 <p> Vyberte si svoju obľúbenú možnosť!</p>
                 <input type="radio" id="num" name="choose" >
                 <label for="num">Zadávanie čísel</label><br>
                 <input type="radio" id="slider" name="choose" >
                 <label for="slider">Posúvač</label><br>
                 <input id="numInp" type="number" name="Input" onchange="this.form.Range.value=this.value" />
                 <input id="rangeInp" type="range" name="Range" onchange="this.form.Input.value=this.value" />
                 <div id="divsdr" class="d"></div>
            </div>
        </form>
    </div>
`;

class Input extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.querySelector('#numInp').value=
            this.getAttribute('value');
        this.shadowRoot.querySelector('#numInp').min=
            this.getAttribute('min');
        this.shadowRoot.querySelector('#numInp').max=
            this.getAttribute('max');
        this.shadowRoot.querySelector('#rangeInp').value=
            this.getAttribute('value');
        this.shadowRoot.querySelector('#rangeInp').min=
            this.getAttribute('min');
        this.shadowRoot.querySelector('#rangeInp').max=
            this.getAttribute('max');

    }

    showRange(){
        this.shadowRoot.querySelector('#divsdr').textContent =
            this.shadowRoot.querySelector('#rangeInp').value;
        document.getElementById('good').textContent=
            this.shadowRoot.querySelector('#divsdr').textContent;
    }

    showNumValue(){
        this.shadowRoot.querySelector('#divsdr').textContent =
            this.shadowRoot.querySelector('#numInp').value;
        document.getElementById('good').textContent=
            this.shadowRoot.querySelector('#divsdr').textContent;
    }

    showNumber(){
        this.shadowRoot.querySelector('#numInp').style.display="block";
        this.shadowRoot.querySelector('#rangeInp').style.display="none";
    }

    showSlider(){
        this.shadowRoot.querySelector('#numInp').style.display="none";
        this.shadowRoot.querySelector('#rangeInp').style.display="block";
    }
    connectedCallback() {
        this.shadowRoot.querySelector('#num').
        addEventListener('change',()=>this.showNumber());
        this.shadowRoot.querySelector('#slider').
        addEventListener('change',()=>this.showSlider());
        this.shadowRoot.querySelector('#rangeInp').
        addEventListener('change',()=>this.showRange())
        this.shadowRoot.querySelector('#numInp').
        addEventListener('change',()=>this.showNumValue())

    }

}
window.customElements.define('my-input',Input);

//=========================================================================================================



let X=[0],Y1=[0],Y2=[1];
let prev_X=[], prev_Y1=[],prev_Y2=[];
let dataUpdate=true,firstGraphDisplay=true,secondGraphDisplay=true;
let firstTrace, secondTrace,source;

let stopButton = document.getElementById("toStop");
let continueButton = document.getElementById("ToContinue");
let drawSin = document.getElementById("sin");
let drawCos = document.getElementById("cos");


if(typeof(EventSource) !== "undefined") {
    source = new EventSource("https://iolab.sk/evaluation/sse/sse.php");
    Plotly.newPlot('graph', [{y:[0]},{y:[1]}]);
    source.onmessage = function (event){
        let a = document.getElementById('good').textContent;
        console.log("a: "+a);
        let dataIn = JSON.parse(event.data);
        document.getElementById("screen").innerHTML = event.data;
        if (+dataIn.x===0){
            Y1[0]=a*(dataIn.y1);
            Y2[0]=a*(dataIn.y2);
        }
        else{
            X.push(dataIn.x);
            Y1.push(a*(dataIn.y1));
            Y2.push(a*(dataIn.y2));
        }
        if (dataUpdate){
            toDrawGraph();
        }

    }
}else {
    document.getElementById("screen").innerHTML = "Sorry, your browser does not support server-sent events...";
}


function toDrawGraph() {
    firstTrace = {
        x: (dataUpdate) ? X : prev_X,
        y: (dataUpdate) ? Y1 : prev_Y1,
        type: 'scatter',
        name: 'Graf Sin',
        line: {
            color: 'rgb(255, 153, 0)',
            width: 2
        }
    };

    secondTrace = {
        x: (dataUpdate) ? X : prev_X,
        y: (dataUpdate) ? Y2 : prev_Y2,
        type: 'scatter',
        name: 'Graf Cos',
        line: {
            color: 'rgb(153, 153, 255)',
            width: 2
        }
    };

    let myLayout = {
        title: 'Grafy Sin a Cos',
        showlegend: true
    };

    Plotly.newPlot('graph', [], myLayout);

    if (firstGraphDisplay && secondGraphDisplay) {
        Plotly.addTraces('graph', [firstTrace]);
        Plotly.addTraces('graph', [secondTrace]);
    } else if (firstGraphDisplay && !secondGraphDisplay) {
        Plotly.addTraces('graph', [firstTrace]);
    } else if (!firstGraphDisplay && secondGraphDisplay) {
        Plotly.addTraces('graph', [secondTrace]);
    }
}
continueButton.addEventListener('click',  () => {
    dataUpdate = true;
    stopButton.style.display = "block";
    continueButton.style.display = "none";

    toDrawGraph();
});


stopButton.addEventListener('click',  () => {
    dataUpdate = false;
    stopButton.style.display = "none";
    continueButton.style.display = "block";
    prev_X = X.slice();
    prev_Y1 = Y1.slice();
    prev_Y2 = Y2.slice();
});

drawSin.addEventListener('click',()=>{
    firstGraphDisplay = !firstGraphDisplay;
    toDrawGraph();
})

drawCos.addEventListener('click',()=>{
    secondGraphDisplay = !secondGraphDisplay;
    toDrawGraph();
})
