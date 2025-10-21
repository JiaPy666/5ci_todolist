import "./style.css"
import {loadFromLocalStorage, saveToLocalStorage} from "./storage"

// Riferimenti a porzioni del DOM
const backlog = document.getElementById("backlog")
const inProgress = document.getElementById("inProgress")
const review = document.getElementById("review")
const done = document.getElementById("done")

// Riferimenti del FORM ISSUE (Modale di Creazione)
const apriFormModale = document.getElementById("apriFormModale")
const formModal = document.getElementById("formModalContainer")
const annullaCreaIssue = document.getElementById("annullaCreaIssue")
const creaIssue = document.getElementById("creaIssue")
const schemaNascosta = document.getElementById("schemaNascosta") // Contenuto del form

// Riferimenti della MODALE CAMBIO STATO
const modal = document.getElementById("modalContainer");
const chiudiBottone = document.getElementById("chiudiModale");
const accetta = document.getElementById("accetta")     

// Variabile per tenere traccia dell'ID del todo da modificare (globale)
let todoIdToUpdate = null;


// **********************************************
// LOGICA FORM MODALE CREAZIONE
// **********************************************
apriFormModale.addEventListener("click", () => {
    formModal.classList.add('attiva');
});

annullaCreaIssue.addEventListener("click", () => {
    formModal.classList.remove('attiva');
    svuota(); 
});

formModal.addEventListener('click', (e) => {
    if (e.target === formModal) {
        formModal.classList.remove('attiva');
        svuota();
    }
});

creaIssue.addEventListener("click", () => {
    // Legge i dati del form
    todolist.push(crea_todo(issue()))
    saveToLocalStorage(todolist) 
    
    // Chiudi la modale del form
    formModal.classList.remove('attiva'); 
    
    svuota()
    RefreshCoseDaFare()
});


// **********************************************
// LOGICA MODALE CAMBIO STATO
// **********************************************
accetta.addEventListener("click", () => {
    
    // Legge il valore dal select nella modale
    const nuovoStato = document.getElementById("statoListaModale").value;
    const todoId = todoIdToUpdate;
    
    if (todoId) {
        // Aggiorna lo stato nel todolist in modo immutabile
        const newTodolist = todolist.map(todo => {
            if (todo.id === todoId) {
                return { ...todo, stato: nuovoStato };
            }
            return todo;
        });

        todolist = newTodolist;
        saveToLocalStorage(todolist);

        modal.classList.remove('attiva');
        RefreshCoseDaFare();
    } else {
        console.warn("Nessun TODO ID trovato per l'aggiornamento.");
    }
});

// Chiusura Modale Cambio Stato (tramite il bottone 'Annulla' dentro il modale)
chiudiBottone.addEventListener('click', () => {
    modal.classList.remove('attiva');
});

// Chiusura Modale Cambio Stato (cliccando sullo sfondo)
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('attiva');
    }
});


// **********************************************
// MODELLO DATI E UTILITY
// **********************************************
const issue = () =>{
    return{
        titolo:document.getElementById("titolo").value,
        descrizione:document.getElementById("descrizione").value,
        assegnatario:document.getElementById("assegnatario").value,
        stato:"Backlog" // Stato iniziale fisso
    }
}

const svuota = () =>{
    document.getElementById("titolo").value = ""
    document.getElementById("descrizione").value = ""
    document.getElementById("assegnatario").value = ""
}

const crea_todo = (issue) => {
    return {
        id:crypto.randomUUID(),         // Genera un id univoco
        titolo:issue.titolo,
        descrizione:issue.descrizione,
        assegnatario:issue.assegnatario,
        stato:issue.stato
    }
}

let todolist = loadFromLocalStorage()

// LOGICA DI ELIMINAZIONE
const eliminaTodo = (todoId) => {
    // Filtra l'array: mantiene solo gli elementi il cui ID NON corrisponde all'ID da eliminare
    const newTodolist = todolist.filter(todo => todo.id !== todoId);
    
    todolist = newTodolist;
    saveToLocalStorage(todolist);
    
    RefreshCoseDaFare();
}


// **********************************************
// FUNZIONE DI VISUALIZZAZIONE
// **********************************************
const aggiornaList = (l,fn) => {
    l.innerText = ""
    todolist.filter(fn).map(listaFiltrata => {
        const contenutoTodo = document.createElement("div");
        contenutoTodo.classList.add("task-container"); 
        
        // Titolo
        const titoloElement = document.createElement("h4");
        titoloElement.innerText = listaFiltrata.titolo;
        contenutoTodo.appendChild(titoloElement);

        // Dettagli (Descrizione, Assegnatario)
        const proprietaDaStampare = ["descrizione", "assegnatario"];
        
        proprietaDaStampare.forEach(key => {
            const listItem = document.createElement("li");
            listItem.innerText = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${listaFiltrata[key]}`; 
            contenutoTodo.appendChild(listItem);
        });

        // Contenitore per i bottoni (per affiancarli)
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-group"); 


        // BOTTONE ELIMINA (Nessuna modifica qui)
        const eliminaButton = document.createElement("button");
        eliminaButton.innerText = "Elimina 🗑️";
        eliminaButton.classList.add("elimina-btn");
        eliminaButton.setAttribute('data-todo-id', listaFiltrata.id);
        
        eliminaButton.addEventListener('click', (e) => {
            const idDaEliminare = e.currentTarget.getAttribute('data-todo-id');
            eliminaTodo(idDaEliminare);
        });
        
        buttonContainer.appendChild(eliminaButton);


        // BOTTONE CAMBIO STATO (MODIFICATO QUI)
        const cambioStato = document.createElement("button")
        
        // **********************************************
        // Modifica la riga seguente:
        cambioStato.innerText = "Sposta"; 
        // **********************************************
        
        cambioStato.classList.add("apriModale")
        cambioStato.setAttribute('data-todo-id', listaFiltrata.id);

        cambioStato.addEventListener('click', (e) => {
            // 1. Salva l'ID
            todoIdToUpdate = e.currentTarget.getAttribute('data-todo-id');
            // 2. Imposta lo stato attuale nel modale prima di aprirlo
            document.getElementById("statoListaModale").value = listaFiltrata.stato;
            // 3. Apri il modale
            modal.classList.add('attiva');
        });
        
        buttonContainer.appendChild(cambioStato);

        // Aggiungi i bottoni al contenuto del TODO
        contenutoTodo.appendChild(buttonContainer)
        l.appendChild(contenutoTodo);
    })
}


const RefreshCoseDaFare = () => {
    // Filtra e visualizza i todo in base al loro stato
    aggiornaList(backlog, x => x.stato === "Backlog")
    aggiornaList(inProgress,x => x.stato === "In Progress")
    aggiornaList(review,x => x.stato === "Review")
    aggiornaList(done,x => x.stato === "Done")
}
RefreshCoseDaFare()