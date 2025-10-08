export const loadFromLocalStorage = () => {
    const local = localStorage.getItem("todolist")
    if (!local) return []
    return JSON.parse(local)
}

export const saveToLocalStorage = (data) => {
    const dataAsJson = JSON.stringify(data) // converto in stringa JSON
    localStorage.setItem("todolist",dataAsJson) // to localStorage
}