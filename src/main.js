import "./style.css"
import {loadFromLocalStorage, saveToLocalStorage} from "./storage"

// riferimnti a porzioni del DOM
const backlog = document.getElementById("backlog")
const inProgress = document.getElementById("inProgress")
const review = document.getElementById("review")
const done = document.getElementById("done")
const newIssue = document.getElementById("newIssue")
const creaIssue = document.getElementById("creaIssue")

newIssue.addEventListener("click", () => {
    // Mostra o nasconde il form
    schemaNascosta.style.display =
    schemaNascosta.style.display === "none" ? "block" : "none"
});

creaIssue.addEventListener("click", () => {
  // Legge i dati del form
  const issue = {
    titolo: document.getElementById("titolo").value,
    descrizione: document.getElementById("descrizione").value,
    assegnatario: document.getElementById("assegnatario").value,
    stato: "Backlog"
  };

  todolist.push(crea_todo(issue))
 
  // Svuota il form e lo nasconde
  schemaNascosta.style.display = "none"
  document.getElementById("titolo").value = ""
  document.getElementById("descrizione").value = ""
  document.getElementById("assegnatario").value = ""
  
  RefreshCoseDaFare()
});

// modello dati
const crea_todo = (issue) => {
    return {
        id:crypto.randomUUID(),         // Genera un id univoco
        titolo:issue.titolo,
        descrizione:issue.descrizione,
        assegnatario:issue.assegnatario,
        stato:issue.stato
    }
}

// const crea_todo_2 = (contenuto) => ({
//     contenuto,
//     completato:false
// })

// const todolist = JSON.parse(localStorage.getItem("todolist")) || []



const todolist = loadFromLocalStorage()
console.log(todolist)

const toggleTodo = (todoId) =>{
    console.log(todoId)
    // ciclo sugli elementi e aggiorno
    for(let i = 0; i < todolist.length; i++){
        if (todolist[i].id == todoId){
            todolist[i].completato = !todolist[i].completato
            console.log(todolist)
            RefreshCoseDaFare()
            return 
        }
    }
    // versione funzionale che ha la stessa funzionalità di quella sopra
    // todolist.filter(x => x.id === todoId).map(x => x.completato = !x.completato)
}

const aggiornaList = (l,fn) => {
    l.innerText = ""

    todolist.filter(fn).map(listaFiltrata => {
        console.log(listaFiltrata);

        const contenutoTodo = document.createElement("div");
        contenutoTodo.classList.add("task-container"); 

        const proprietaDaStampare = ["titolo", "descrizione", "assegnatario"];

        proprietaDaStampare.forEach(key => {
            const listItem = document.createElement("li");

            listItem.innerText = listaFiltrata[key];

            contenutoTodo.appendChild(listItem);
        });
        
        const cambioStato = document.createElement("button");

        cambioStato.innerText = "Apri Dettagli"; 
        
        cambioStato.classList.add("apriModale"); 

        contenutoTodo.appendChild(cambioStato)
        
        l.appendChild(contenutoTodo);

        // `` => (alt + 096) è uguale al FString del python, ${}serve per chiamare la variabile
        // l.innerHTML += `<li>${x.contenuto}<button data-todo-id="${x.id} class='toggle'">?</button></li>`                       
    })
}

const RefreshCoseDaFare = () => {
    // dafare.innerText = ""

    // todolist.filter(x => x.completato === false).map(x => {
    //     dafare.innerHTML += `<li>${x.contenuto}</li>`                       
    // })

    aggiornaList(backlog,x => x.stato === "Backlog")
    
    // completato.innerText = ""

    // todolist.filter(x => x.completato === true).map(x => {
    //     completato.innerHTML += `<li>${x.contenuto}</li>`                       
    // })

    aggiornaList(inProgress,x => x.completato === "In Progress")

    aggiornaList(review,x => x.completato === "Review")

    aggiornaList(done,x => x.completato === "Done")
}
RefreshCoseDaFare()

console.log(crypto.randomUUID())

