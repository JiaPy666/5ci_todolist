# TODO LIST

Una todolist è un gestire di un elenco di cose da fare

## User stories

- [x] come utente voglio rendere persistenti di dati salvati
- [x] come utente voglio che visuallizzi l'elenco delle cosa da fare e delle cose già fatte
- [x] come utente voglio eliminare un todo
- [x] come utente voglio creare un todo
- [] come utente voglio impostare una scadenza(deadline) per un todo
- [] come utente voglio marcare come fatto uno specifico todo
- [] come utente voglio filtrare l'elenco delle cose da fare rispetto a una stringa

# modello dati

todo:
- contenuto:str
- scadenza:date (*)
- completato:bool


## Requisiti

### funzionari

- rendere persistenti di dati salvati
- l'elenco delle cosa da fare e delle cose già fatte
- creare un todo
- eliminare un todo
- marcare come fatto uno specifico todo

### non funzionari

- impostazione semplice e di facile utilizzo
- Server Web (python da riga di comando)
- JavaScript + HTML + CSS