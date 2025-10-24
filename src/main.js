import "./style.css"
import {loadFromLocalStorage, saveToLocalStorage} from "./storage"

// Riferimenti al Theme Controller
const themeSwapButton = document.getElementById("themeSwapButton");
const themeIcon = document.getElementById("themeIcon");
const body = document.body;

// ----------------------------------------------------
// LOGICA CONTROLLORE TEMA
// ----------------------------------------------------

const THEME_STORAGE_KEY = "kanbanTheme";
const DARK_MODE_CLASS = "dark-mode";

const setIconAndClass = (isDark) => {
    if (isDark) {
        body.classList.add(DARK_MODE_CLASS);
        themeIcon.innerText = "🌙"; // Luna per tema scuro
    } else {
        body.classList.remove(DARK_MODE_CLASS);
        themeIcon.innerText = "☀️"; // Sole per tema chiaro
    }
};

const loadTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    // Di default è tema chiaro (savedTheme === null o 'light')
    const isDark = savedTheme === "dark"; 
    setIconAndClass(isDark);
};

// Logica per il cambio tema al click
themeSwapButton.addEventListener("click", () => {
    const isCurrentlyDark = body.classList.contains(DARK_MODE_CLASS);
    const newTheme = isCurrentlyDark ? "light" : "dark";

    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setIconAndClass(newTheme === "dark");
});

// Carica il tema all'avvio dell'applicazione
loadTheme();
// ----------------------------------------------------
// FINE LOGICA CONTROLLORE TEMA
// ----------------------------------------------------


// ----------------------------------------------------
// LOGICA DISPLAY DATA CORRENTE
// ----------------------------------------------------

const dateDisplay = document.getElementById("currentDateDisplay");

// Mappa per tradurre il mese in italiano
const months = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

const updateDateDisplay = () => {
    const today = new Date();
    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();

    // Formato "24 Ottobre 2025"
    dateDisplay.innerText = `${day} ${month} ${year}`;
};

// Funzione per calcolare il tempo rimanente alla mezzanotte
const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // Il giorno dopo
        0, 0, 0 // A 00:00:00
    );
    return midnight.getTime() - now.getTime();
};

const setupDailyUpdate = () => {
    // 1. Aggiorna immediatamente
    updateDateDisplay();

    // 2. Calcola l'attesa fino alla mezzanotte
    const delay = getTimeUntilMidnight();

    // 3. Imposta il timer per l'aggiornamento alla mezzanotte
    setTimeout(() => {
        // Quando scatta la mezzanotte:
        updateDateDisplay(); // Aggiorna la data
        
        // Imposta immediatamente un intervallo per i giorni successivi (24 ore in millisecondi)
        setInterval(updateDateDisplay, 24 * 60 * 60 * 1000); 

    }, delay);
};

setupDailyUpdate();

// FINE LOGICA DISPLAY DATA CORRENTE
// Riferimenti a porzioni del DOM
const backlog = document.getElementById("backlog")
const inProgress = document.getElementById("inProgress")
const review = document.getElementById("review")
const done = document.getElementById("done")

// Riferimenti del FORM ISSUE
const apriFormModale = document.getElementById("apriFormModale")
const formModal = document.getElementById("formModalContainer")
const annullaCreaIssue = document.getElementById("annullaCreaIssue")
const salvaIssue = document.getElementById("salvaIssue") 

// Riferimento al titolo dinamico della modale
const titoloModale = document.getElementById("titoloModale") 
const schemaNascosta = document.getElementById("schemaNascosta") 

// Riferimenti della MODALE CAMBIO STATO
const modal = document.getElementById("modalContainer");
const chiudiBottone = document.getElementById("chiudiModale");
const accetta = document.getElementById("accetta")     

// Variabile per tenere traccia dell'ID del todo da modificare
let todoIdToUpdate = null;
// Variabile per indicare la modalità modifica
let isEditing = false; 

// VARIABILE GLOBALE PER I TIMER
let activeTimers = {}; 

// LOGICA FORM MODALE CREAZIONE/MODIFICA
apriFormModale.addEventListener("click", () => {
    isEditing = false;
    todoIdToUpdate = null;
    svuota(); 
    titoloModale.innerText = "Nuova issue"; // Imposta il titolo per la creazione
    salvaIssue.innerText = "Crea"; // Imposta il testo del bottone
    formModal.classList.add('attiva');
});

annullaCreaIssue.addEventListener("click", () => {
    formModal.classList.remove('attiva');
    svuota(); 
    isEditing = false; // Reset
});


// LOGICA: GESTORE CLICK PER CREAZIONE O AGGIORNAMENTO
salvaIssue.addEventListener("click", () => { 
    // Legge i dati del form
    const issueData = issue();
    
    if (isEditing && todoIdToUpdate) {
        // MODALITÀ AGGIORNAMENTO
        const newTodolist = todolist.map(todo => {
            if (todo.id === todoIdToUpdate) {
                return { 
                    ...todo, 
                    titolo: issueData.titolo,
                    descrizione: issueData.descrizione,
                    assegnatario: issueData.assegnatario,
                    dataScadenza: issueData.dataScadenza 
                };
            }
            return todo;
        });

        todolist = newTodolist;
        isEditing = false; // Esci dalla modalità modifica
        todoIdToUpdate = null;

    } else {
        // MODALITÀ CREAZIONE
        todolist.push(crea_todo(issueData))
    }
    
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

// Chiusura Modale Cambio Stato 
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

// Prepara e apre la modale in modalità modifica
const openEditModal = (todo) => {
    isEditing = true;
    todoIdToUpdate = todo.id;
    
    // Popola i campi con i dati esistenti
    document.getElementById("titolo").value = todo.titolo;
    document.getElementById("descrizione").value = todo.descrizione;
    document.getElementById("assegnatario").value = todo.assegnatario;
    document.getElementById("dataScadenza").value = todo.dataScadenza; 
    
    // Aggiorna il titolo e il bottone della modale
    titoloModale.innerText = "Modifica issue"; 
    salvaIssue.innerText = "Salva Modifiche";
    
    // Apri il modale
    formModal.classList.add('attiva');
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
    let isExpired = false; // INIZIALIZZA LA VARIABILE DI STATO SCADUTO

    if (distance < 0) {
        clearInterval(activeTimers[taskId]);
        countdownText = "SCADUTO";
        isExpired = true; // IMPOSTATO A TRUE QUANDO SCADUTO
    } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

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
    
    return isExpired; // RITORNA LO STATO DI SCADENZA AL CHIAMANTE
}


let todolist = loadFromLocalStorage()

// ELIMINAZIONE
const eliminaTodo = (todoId) => {
    // Ferma il timer associato
    clearInterval(activeTimers[todoId]);
    delete activeTimers[todoId];
    
    // Filtra l'array: mantiene solo gli elementi il cui ID NON corrisponde all'ID da eliminare
    const newTodolist = todolist.filter(todo => todo.id !== todoId);
    
    todolist = newTodolist;
    saveToLocalStorage(todolist);
    
    // Ricarica la lista
    RefreshCoseDaFare();
}


// FUNZIONE DI VISUALIZZAZIONE
const aggiornaList = (l,fn) => {
    l.innerText = ""
    todolist.filter(fn).map(listaFiltrata => {
        const contenutoTodo = document.createElement("div");
        contenutoTodo.classList.add("task-container"); 
        
        // CONTENITORE PER LE AZIONI IN ALTO
        const topActionsContainer = document.createElement("div");
        topActionsContainer.classList.add("top-actions-container");
        
        
        // BOTTONE MODIFICA
        const modificaButton = document.createElement("button");
        modificaButton.innerText = "✏️";
        modificaButton.classList.add("top-edit-btn"); 
        
        modificaButton.addEventListener('click', () => {
            openEditModal(listaFiltrata); 
        });
        topActionsContainer.appendChild(modificaButton);


        // AGGIUNGI L'ELEMENTO COUNTDOWN
        const countdownElement = document.createElement("p");

        // Aggiungi un ID unico per poterlo aggiornare con setInterval
        countdownElement.id = `countdown-${listaFiltrata.id}`; 
        countdownElement.classList.add("countdown-top-right"); 
        topActionsContainer.appendChild(countdownElement); 
        
        contenutoTodo.appendChild(topActionsContainer); // Appendi il contenitore delle azioni


        // GESTIONE CLASSI DI STATO (DONE/EXPIRED)
        if (listaFiltrata.stato === "Done") {
            // Colore verde se Done.
            contenutoTodo.classList.add('done-task');
            contenutoTodo.classList.remove('expired-task'); // Assicura che la classe scaduta non venga applicata.
            
            // AGGIUNGI LA NUOVA CLASSE PER LO STILE DEL TESTO "COMPLETATO"
            countdownElement.classList.add('done-status-badge');
            countdownElement.innerText = "COMPLETATO";
            
            // Rimuovi le classi di formattazione del countdown normale
            countdownElement.classList.remove('expired'); 
            
            // Ferma qualsiasi timer esistente per questo TODO
            clearInterval(activeTimers[listaFiltrata.id]);
            delete activeTimers[listaFiltrata.id];

        } else if (listaFiltrata.dataScadenza) {
            
            // Rimuovi le classi dello stato Done se presente
            contenutoTodo.classList.remove('done-task'); 
            countdownElement.classList.remove('done-status-badge'); // Rimuovi il badge verde
            
            // Se non è Done, controlla la scadenza
            const isExpired = updateCountdown(listaFiltrata.id, listaFiltrata.dataScadenza);
            
            if (isExpired) {
                contenutoTodo.classList.add('expired-task'); 
            } else {
                contenutoTodo.classList.remove('expired-task');
            }
            
            // Avvia l'intervallo (se non è già attivo)
            if (!activeTimers[listaFiltrata.id]) {
                const timer = setInterval(() => {
                    // Controlla lo stato all'interno del timer per sicurezza (anche se il Refresh dovrebbe bastare)
                    if (todolist.find(t => t.id === listaFiltrata.id && t.stato === "Done")) {
                        // Se è Done, ferma il timer
                        clearInterval(activeTimers[listaFiltrata.id]);
                        delete activeTimers[listaFiltrata.id];
                        return;
                    }

                    const isNowExpired = updateCountdown(listaFiltrata.id, listaFiltrata.dataScadenza);
                    
                    if (isNowExpired) {
                        contenutoTodo.classList.add('expired-task'); 
                    } else {
                        contenutoTodo.classList.remove('expired-task');
                    }
                }, 1000); 
                
                activeTimers[listaFiltrata.id] = timer;
            }
        } else {
            // Caso: Nessuna data e non Done
            countdownElement.innerText = "Data non impostata";
            countdownElement.style.color = "#ccc"; 
            contenutoTodo.classList.remove('expired-task');
            contenutoTodo.classList.remove('done-task'); 
            countdownElement.classList.remove('done-status-badge');
            countdownElement.classList.remove('expired');
        }

        // Titolo del Todo
        const titoloElement = document.createElement("h4");

        // Piccolo margine per non scontrarsi con il bottone
        titoloElement.style.marginTop = "15px"; 
        titoloElement.innerText = listaFiltrata.titolo;
        contenutoTodo.appendChild(titoloElement);

        // Contenuto del Todo
        const proprietaDaStampare = ["descrizione", "assegnatario", "dataScadenza"];
        
        proprietaDaStampare.forEach(key => {
            const listItem = document.createElement("li");
            listItem.innerText = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${listaFiltrata[key]}`; 
            contenutoTodo.appendChild(listItem);
        });

        // Contenitore per i bottoni (Elimina e Sposta in basso)
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
            // Salva l'ID
            todoIdToUpdate = e.currentTarget.getAttribute('data-todo-id');
            // Imposta lo stato attuale nel modale prima di aprirlo
            document.getElementById("statoListaModale").value = listaFiltrata.stato;
            // Apri il modale
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