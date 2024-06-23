class TodoItem{
    constructor(checked, text){
        this.checked=checked;
        this.text=text;
    }
}

class UI{
    static displayItems(){

        const todoItems=Store.getTodoItems();

        todoItems.forEach(item =>{ UI.addItem(item)});

        
        UI.updateItemsCount();

        document.querySelectorAll(".all").forEach(i=>i.classList.add("mode"));
    }


    static addItem(item){
        // create new todoitem <li>
        const newtodo=document.createElement("li");
        newtodo.className="todo_item";


        // create  and insert checkbox
        const check=document.createElement("input");
        check.type="checkbox";
        check.className="todo_item_check";
        check.checked=item.checked;
        check.name="todo_item_check";
        newtodo.appendChild(check);

        // create and insert text
        const text=document.createElement("span");
        text.className="todo_item_text";
        text.innerHTML=item.text;
        if(item.checked=="checked")
            text.classList.add("cross");
        
        if((document.querySelector(".active").classList.contains("mode") && item.checked=="checked") || (document.querySelector(".completed").classList.contains("mode") && item.checked==""))
            newtodo.classList.add("hide");

        newtodo.appendChild(text);

        // create and insert delete button
        const btn=document.createElement("button");
        btn.className="delete_button";
        btn.textContent='X';
        newtodo.appendChild(btn);

        // adding todoitem to list
        const ul=document.querySelector("ul");
        const li=ul.firstElementChild;
        ul.insertBefore(newtodo, li);


    }

    static deleteItem(li){
        li.remove();
        UI.updateItemsCount();
    }

    static updateItemsCount(){
        const li=document.querySelectorAll("li");
        let count=-1;
        if(document.querySelector(".completed").classList.contains("mode")){
            count=0;
            li.forEach(i=>{
                if((i.children[1].classList.contains("cross")))
                    count++;
            });
            li[li.length-1].firstElementChild.textContent=`${count} items completed`;
        }
        else if(document.querySelector(".active").classList.contains("mode")){
            li.forEach(i=>{
                if(!(i.children[1].classList.contains("cross")))
                    count++;
            });
            li[li.length-1].firstElementChild.textContent=`${count} items todo`;
        }
        else{
            li.forEach(i=>{
                    count++;
            });
            li[li.length-1].firstElementChild.textContent=`${count} items noted`;
        }
    }


    static clearCompleted(){
        document.querySelectorAll(".todo_item").forEach(todo=>{
            if(todo.children[1].classList.contains("cross")){
                UI.deleteItem(todo);
                Store.deleteTodoItem(todo.children[1].textContent);
            }
        });

    }

    static filterActive(){
        document.querySelectorAll(".todo_item").forEach(todo=>{
        
            if(todo.children[1].classList.contains("cross")){
                todo.classList.add("hide");
            }
            else{
                todo.classList.remove("hide");
            }
            UI.updateItemsCount();
        });
    }
    
    static filterCompleted(){
        document.querySelectorAll(".todo_item").forEach(todo=>{
        
            if(todo.children[1].classList.contains("cross")){
                todo.classList.remove("hide");
            }
            else{
                todo.classList.add("hide");
            }
            UI.updateItemsCount();

        });
    }

    static filterAll(){
        document.querySelectorAll(".todo_item").forEach(todo=>{
            todo.classList.remove("hide");
        });
        UI.updateItemsCount();
    }
    
}

// Store
class Store{
    static getTodoItems(){
        let todos=[];
        
        if(localStorage.getItem("todos")==null)
            todos=[];
        else
            todos=JSON.parse(localStorage.getItem("todos"));

        return todos;
    }

    static addTodoItem(item){
        let todos=Store.getTodoItems();

        todos.push(item);
        localStorage.setItem("todos",JSON.stringify(todos));
    }

    static deleteTodoItem(text){
        let todos=Store.getTodoItems();

        todos=todos.filter(todo=> !(todo.text===text));

        localStorage.setItem("todos",JSON.stringify(todos));
    }

    static crossTodoItem(text){
        let todos=Store.getTodoItems();

        todos=todos.map(todo=> {
            if(todo.text===text)
                todo.checked=(todo.checked==="checked")?"":"checked";
            return todo;
        });

        localStorage.setItem("todos",JSON.stringify(todos));
    }
    
}


document.addEventListener("DOMContentLoaded",UI.displayItems());



const form=document.querySelector("form");
// form events
form.addEventListener("click", (e)=>{
    // form checkbox 
    if(e.target.className==="new_todo_checkbox")
        e.target.nextElementSibling.classList.toggle("cross");
});

// UI events
document.querySelector("ul").addEventListener("click",(e)=>ul(e));

// mobile events
document.querySelector(".mobile").addEventListener("click",(e)=>ul(e));

function ul(e){
    // items checkbox
    if(e.target.className==="todo_item_check")
        checkMark(e.target.nextElementSibling);

    // delete event
    if(e.target.className==="delete_button"){
        UI.deleteItem(e.target.parentElement);
        Store.deleteTodoItem(e.target.previousElementSibling.textContent);
    }
    // clear completed event
    if(e.target.className==="clear_completed")
        UI.clearCompleted();

    // filter active
    if(e.target.classList.contains("active")){
        if(!e.target.classList.contains("mode")){
            document.querySelectorAll(".all").forEach(i=>i.classList.remove("mode"));
            document.querySelectorAll(".active").forEach(i=>i.classList.add("mode"));
            document.querySelectorAll(".completed").forEach(i=>i.classList.remove("mode"));

            UI.filterActive();
        }
    }

    // filter completed
    if(e.target.classList.contains("completed")){
        if(!e.target.classList.contains("mode")){
            document.querySelectorAll(".all").forEach(i=>i.classList.remove("mode"));
            document.querySelectorAll(".active").forEach(i=>i.classList.remove("mode"));
            document.querySelectorAll(".completed").forEach(i=>i.classList.add("mode"));

            UI.filterCompleted();
        }
    }

    //filter all
    if(e.target.classList.contains("all")){
        if(!e.target.classList.contains("mode")){
            document.querySelectorAll(".all").forEach(i=>i.classList.add("mode"));
            document.querySelectorAll(".active").forEach(i=>i.classList.remove("mode"));
            document.querySelectorAll(".completed").forEach(i=>i.classList.remove("mode"));

            UI.filterAll();
        }
    }
}


function checkMark(text){
    text.classList.toggle("cross");
    Store.crossTodoItem(text.textContent);
    if(document.querySelector(".active").classList.contains("mode")|| document.querySelector(".completed").classList.contains("mode")){
        text.parentElement.classList.add("hide");
        UI.updateItemsCount();
    }
}



// add new todoItem
form.addEventListener("submit", (e)=>{
    e.preventDefault();

    // validation
    // // empty todo validation
    if(e.target.children[1].value==""){
        const err=document.createElement("div");

        err.className="error";
        err.textContent="Please Enter non-Empty Task";
        document.querySelector(".container").insertBefore(err, document.querySelector("form"));
        
        setTimeout(()=> err.remove(), 1500);
    }
    else{
    let checked=(e.target.children[1].classList.contains("cross"))?"checked":"";
    const todo=new TodoItem(checked, e.target.children[1].value);
    UI.addItem(todo);
    Store.addTodoItem(todo);

    e.target.firstElementChild.checked="";
    e.target.children[1].value="";
    e.target.children[1].classList.remove("cross");

    UI.updateItemsCount();
    }
});


