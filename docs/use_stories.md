# TODO LIST

Una todolist è  un gestore di un elenco di cose da fare

## User stories

- come utente voglio rendere persistenti i dati salvati
- come utente voglio che visualizzi l'elenco delle cose da fare e delle cose già fatte
- come utente voglio eliminare un todo
- come utente voglio creare un todo
- come utente voglio impostare una scadenza (deadline) per un todo
- come utente voglio marcare come fatto uno specifico todo
- come utente voglio filtrare l'elenco delle cose da fare rispetto a una stringa

# modello dati

todo:
- contenuto:str
- scadenza:date (*)
- completato:bool 


## Requisiti

### funzionali

- [x] rendere persistenti i dati salvati
- [ ] elenco delle cose da fare e delle cose già fatte
- creare un todo
- eliminare un todo
- marcare come fatto uno specifico todo

### non funzionali

- impostazione semplice e di facile utilizzo
- Server Web (python da riga di comando)
- Java + HTML + CSS
