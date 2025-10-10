import "./style.css"
import {loadFromLocalStorage, saveToLocalStorage} from "./storage"

// riferimnti a porzioni del DOM
const dafare = document.getElementById("dafare")
const completato = document.getElementById("completato")

// modello dati
const crea_todo = (contenuto) => {
    return {
        id:crypto.randomUUID(),         // Genera un id univoco
        contenuto:contenuto,
        completato:false
    }
}

// const crea_todo_2 = (contenuto) => ({
//     contenuto,
//     completato:false
// })

// const todolist = JSON.parse(localStorage.getItem("todolist")) || []



const todolist = loadFromLocalStorage()
console.log(todolist)

const todoA = crea_todo("prova")
todolist.push(crea_todo("prova"))
todolist.push(crea_todo("prova"))
todolist.push(todoA)

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

    todolist.filter(fn).map(x => {
        console.log(x)
        const li = document.createElement("li")
        li.innerText = x.contenuto
        li.onclick = () => toggleTodo(x.id)
        
        l.appendChild(li)
        // `` => (alt + 096) è uguale al FString del python, ${}serve per chiamare la variabile
        // l.innerHTML += `<li>${x.contenuto}<button data-todo-id="${x.id} class='toggle'">?</button></li>`                       
    })
}

const RefreshCoseDaFare = () => {
    // dafare.innerText = ""

    // todolist.filter(x => x.completato === false).map(x => {
    //     dafare.innerHTML += `<li>${x.contenuto}</li>`                       
    // })

    aggiornaList(dafare,x => x.completato === false)
    
    // completato.innerText = ""

    // todolist.filter(x => x.completato === true).map(x => {
    //     completato.innerHTML += `<li>${x.contenuto}</li>`                       
    // })

    aggiornaList(completato,x => x.completato === true)
}
RefreshCoseDaFare()

console.log(crypto.randomUUID())

