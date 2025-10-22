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

// NUOVA VARIABILE GLOBALE PER I TIMER: Mappa per conservare i riferimenti agli setInterval
let activeTimers = {}; 

// LOGICA FORM MODALE CREAZIONE
apriFormModale.addEventListener("click", () => {
    formModal.classList.add('attiva');
});

annullaCreaIssue.addEventListener("click", () => {
    formModal.classList.remove('attiva');
    svuota(); 
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


// LOGICA MODALE CAMBIO STATO
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



// MODELLO DATI E UTILITY
const issue = () =>{
    return{
        titolo:document.getElementById("titolo").value,
        descrizione:document.getElementById("descrizione").value,
        assegnatario:document.getElementById("assegnatario").value,
        dataScadenza:document.getElementById("dataScadenza").value,
        stato:"Backlog" // Stato iniziale fisso
    }
}

const svuota = () =>{
    document.getElementById("titolo").value = ""
    document.getElementById("descrizione").value = ""
    document.getElementById("assegnatario").value = ""
    document.getElementById("dataScadenza").value = ""
}

const crea_todo = (issue) => {
    return {
        id:crypto.randomUUID(),         // Genera un id univoco
        titolo:issue.titolo,
        descrizione:issue.descrizione,
        assegnatario:issue.assegnatario,
        dataScadenza:issue.dataScadenza,
        stato:issue.stato
    }
}

// FUNZIONE PER CALCOLARE, FORMATTARE E AGGIORNARE IL COUNTDOWN DINAMICO
const updateCountdown = (taskId, dataScadenza) => {
    const countdownElement = document.getElementById(`countdown-${taskId}`);
    if (!countdownElement) {
        // Se l'elemento non esiste più (es. task eliminato), ferma il timer
        clearInterval(activeTimers[taskId]);
        delete activeTimers[taskId];
        return false; // Ritorna false se il timer è fermato
    }

    // Aggiungo 23:59:59 al giorno selezionato per contare fino alla fine del giorno di scadenza
    const scadenza = new Date(dataScadenza).getTime();
    const fineGiornoScadenza = scadenza + (24 * 60 * 60 * 1000) - 1; 
    
    const now = new Date().getTime();
    const distance = fineGiornoScadenza - now;

    let countdownText;
    let isExpired = false; // <<< INIZIALIZZA LA VARIABILE DI STATO SCADUTO

    if (distance < 0) {
        clearInterval(activeTimers[taskId]);
        countdownText = "SCADUTO";
        isExpired = true; // <<< IMPOSTATO A TRUE QUANDO SCADUTO
    } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // MODIFICATO: Aggiunto span con classe 'countdown-label' per il contesto
        countdownText = 
            `<span class="countdown-value">${days}</span><span class="countdown-label">d:</span>` +
            `<span class="countdown-value">${hours}</span><span class="countdown-label">h:</span>` +
            `<span class="countdown-value">${minutes}</span><span class="countdown-label">m:</span>` +
            `<span class="countdown-value">${seconds}</span><span class="countdown-label">s</span>`;
    }

    countdownElement.innerHTML = countdownText;
    
    // Applica stile diverso se scaduto
    if (isExpired) {
        countdownElement.classList.add('expired');
    } else {
        countdownElement.classList.remove('expired');
    }
    
    return isExpired; // <<< RITORNA LO STATO DI SCADENZA AL CHIAMANTE
}


let todolist = loadFromLocalStorage()

// LOGICA DI ELIMINAZIONE
const eliminaTodo = (todoId) => {
    // 1. Ferma il timer associato
    clearInterval(activeTimers[todoId]);
    delete activeTimers[todoId];
    
    // 2. Filtra l'array: mantiene solo gli elementi il cui ID NON corrisponde all'ID da eliminare
    const newTodolist = todolist.filter(todo => todo.id !== todoId);
    
    todolist = newTodolist;
    saveToLocalStorage(todolist);
    
    // 3. Ricarica la lista
    RefreshCoseDaFare();
}


// FUNZIONE DI VISUALIZZAZIONE
const aggiornaList = (l,fn) => {
    l.innerText = ""
    todolist.filter(fn).map(listaFiltrata => {
        const contenutoTodo = document.createElement("div");
        contenutoTodo.classList.add("task-container"); 
        
        // =========================================================
        // AGGIUNGI L'ELEMENTO COUNTDOWN SUBITO ALL'INIZIO (per posizionamento assoluto)
        // =========================================================
        const countdownElement = document.createElement("p");
        // Aggiungi un ID unico per poterlo aggiornare con setInterval
        countdownElement.id = `countdown-${listaFiltrata.id}`; 
        // CLASSE PER POSIZIONAMENTO
        countdownElement.classList.add("countdown-top-right"); 
        contenutoTodo.appendChild(countdownElement); 
        
        // Avvia il countdown
        if (listaFiltrata.dataScadenza) {
            
            // CONTROLLO INIZIALE E GESTIONE STILE CARD
            const isExpired = updateCountdown(listaFiltrata.id, listaFiltrata.dataScadenza);
            
            if (isExpired) {
                contenutoTodo.classList.add('expired-task'); // <<< APPLICA CLASSE AL CONTENITORE SE SCADUTO
            } else {
                contenutoTodo.classList.remove('expired-task'); // Rimuovi per sicurezza
            }
            
            // Avvia l'intervallo (se non è già attivo)
            if (!activeTimers[listaFiltrata.id]) {
                const timer = setInterval(() => {
                    const isNowExpired = updateCountdown(listaFiltrata.id, listaFiltrata.dataScadenza);
                    
                    if (isNowExpired) {
                        contenutoTodo.classList.add('expired-task'); // <<< APPLICA CLASSE AL CONTENITORE SE SCADUTO
                    } else {
                        contenutoTodo.classList.remove('expired-task');
                    }
                }, 1000); // Aggiorna ogni 1000ms (1 secondo)
                
                activeTimers[listaFiltrata.id] = timer;
            }
        } else {
            countdownElement.innerText = "Data non impostata";
            countdownElement.style.color = "#ccc"; // Stile discreto
        }
        
        // =========================================================

        // Titolo del Todo
        const titoloElement = document.createElement("h4");
        titoloElement.innerText = listaFiltrata.titolo;
        contenutoTodo.appendChild(titoloElement);

        // Contenuto del Todo
        const proprietaDaStampare = ["descrizione", "assegnatario", "dataScadenza"];
        
        proprietaDaStampare.forEach(key => {
            const listItem = document.createElement("li");
            listItem.innerText = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${listaFiltrata[key]}`; 
            contenutoTodo.appendChild(listItem);
        });

        // Contenitore per i bottoni 
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-group"); 


        // BOTTONE ELIMINA 
        const eliminaButton = document.createElement("button");
        eliminaButton.innerText = "Elimina 🗑️";
        eliminaButton.classList.add("elimina-btn");
        eliminaButton.setAttribute('data-todo-id', listaFiltrata.id);
        
        eliminaButton.addEventListener('click', (e) => {
            const idDaEliminare = e.currentTarget.getAttribute('data-todo-id');
            eliminaTodo(idDaEliminare);
        });
        
        buttonContainer.appendChild(eliminaButton);


        // BOTTONE CAMBIO STATO 
        const cambioStato = document.createElement("button")
        cambioStato.innerText = "Sposta";
        
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
    // FERMA TUTTI I TIMER ATTIVI PRIMA DI RICREARE LA LISTA
    Object.values(activeTimers).forEach(clearInterval);
    activeTimers = {}; // Svuota la mappa dei timer
    
    // Filtra e visualizza i todo in base al loro stato
    aggiornaList(backlog, x => x.stato === "Backlog")
    aggiornaList(inProgress,x => x.stato === "In Progress")
    aggiornaList(review,x => x.stato === "Review")
    aggiornaList(done,x => x.stato === "Done")
}
RefreshCoseDaFare()