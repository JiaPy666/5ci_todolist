import "./style.css"
import {loadFromLocalStorage, saveToLocalStorage} from "./storage"

// riferimnti a porzioni del DOM
const dafare = document.getElementById("dafare")
const completato = document.getElementById("completato")

// modello dati

const crea_todo = (contenuto) => {
    return {
        contenuto:contenuto,
        completato:false
    }
}

// const crea_todo_2 = (contenuto) => ({
//     contenuto,
//     completato:false
// })

//const todolist = JSON.parse(localStorage.getItem("todolist")) || []



const todolist = loadFromLocalStorage()
console.log(todolist)

const todoA = crea_todo("prova")
todolist.push(todoA)
todolist.push(todoA)
todolist.push(todoA)

const aggiornaList = (l,Fr) => {
    l.innerText = ""

    todolist.filter(Fr).map(x => {
        l.innerHTML += `<li>${x.contenuto}</li>`                       // `` alt + 096 è uguale al FString del python
    })
}

const RefreshCoseDaFare = () => {
    dafare.innerText = ""

    todolist.filter(x => x.completato === false).map(x => {
        dafare.innerHTML += `<li>${x.contenuto}</li>`                       // `` alt + 096 è uguale al FString del python
    })

    aggiornaList(dafare,x => x.completato === false)
    
    completato.innerText = ""

    todolist.filter(x => x.completato === true).map(x => {
        completato.innerHTML += `<li>${x.contenuto}</li>`                       // `` alt + 096 è uguale al FString del python
    })

    aggiornaList(completato,x => x.completato === true)
}

RefreshCoseDaFare()