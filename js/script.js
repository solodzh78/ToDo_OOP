'use strict';

class ToDo {
  constructor(form, input, todoList, todoCompleted) {
    this.form = document.querySelector(form);
    this.input = document.querySelector(input);
    this.todoList = document.querySelector(todoList);
    this.todoCompleted = document.querySelector(todoCompleted);
    this.todoData = new Map(JSON.parse(localStorage.getItem('toDoList')));
  }

  addToStorage() {
    localStorage.setItem('toDoList', JSON.stringify([...this.todoData]));
  }

  render() {
    this.todoList.textContent = '';
    this.todoCompleted.textContent = '';
    this.todoData.forEach(this.createItem, this);
    this.addToStorage();
  }

  createItem(todo) {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    li.key = todo.key;
    li.insertAdjacentHTML('beforeEnd', `
    		<span class="text-todo">${todo.value}</span>
				<div class="todo-buttons">
          <button class="todo-edit"></button>
					<button class="todo-remove"></button>
					<button class="todo-complete"></button>
				</div>
    `);

    if (todo.completed) {
      this.todoCompleted.append(li);
    } else {
      this.todoList.append(li);
    }
  }

  addTodo(e) {
    e.preventDefault();

    if (this.input.value.trim()) {
      const newTodo = {
        value: this.input.value,
        completed: false,
        key: this.generateKey()
      };
      this.todoData.set(newTodo.key, newTodo);
      this.input.value = '';

      this.render();
    }
  }
  generateKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  deleteItem(target) {

    this.itemDeleteAnim(target.parentElement.parentElement)
      .then(() => {
        this.todoData.delete(target.parentElement.parentElement.key);
        target.parentElement.parentElement.remove();
        this.addToStorage();
      });
  }

  editItem(target) {
    const todoItem = target.parentElement.parentElement;
    const todoText = todoItem.children[0];
    todoText.contentEditable = true;
    todoText.focus();
    todoText.addEventListener('blur', () => {
      todoText.contentEditable = false;
      const todoDataItem = this.todoData.get(todoItem.key);
      todoDataItem.value = todoText.textContent;
      this.todoData.set(todoDataItem.key, todoDataItem);

      this.render();
    });
  }

  itemDeleteAnim(target) {
    return new Promise(resolve => {
      let count = 1;
      target.style.opacity = '1';
      requestAnimationFrame(function itemDelete() {
        count -= 0.05;
        target.style.opacity = count.toString();

        if (target.style.opacity <= 0) {
          target.style.opacity = 0;
          resolve();
        } else {
          requestAnimationFrame(itemDelete);
        }
      });
    });
  }

  itemCompletedAnim(target) {
    return new Promise(resolve => {
      let count = 0;
      target.style.opacity = '0';
      requestAnimationFrame(function itemCompleleted() {
        count += 0.05;
        target.style.opacity = count.toString();

        if (target.style.opacity >= 1) {
          target.style.opacity = 1;
          resolve();
        } else {
          requestAnimationFrame(itemCompleleted);
        }
      });
    });
  }

  completedItem(target) {
    const todoItem = target.parentElement.parentElement; // Элемент li
    const todoDataItem = this.todoData.get(todoItem.key); // Объект с элементом
    todoDataItem.completed = !todoDataItem.completed;
    this.todoData.set(todoDataItem.key, todoDataItem);
    this.addToStorage();

    let keyAfter = '';
    let itemAfter = null;
    let flag = false;
    const todoDataArr = [...this.todoData];
    for (let i = 0; i < todoDataArr.length; i++) {

      if (todoDataArr[i][1].completed === todoDataItem.completed && flag) {
        keyAfter = todoDataArr[i][0];
        flag = false;
        break;
      }

      if (todoDataArr[i][0] === todoDataItem.key) {
        flag = true;
      }
    }

    document.querySelectorAll('li').forEach(elem => {

      if (elem.key === keyAfter) {
        itemAfter = elem;
      }
    });

    this.itemDeleteAnim(todoItem)
      .then(() => {
        todoItem.remove();
        if (todoDataItem.completed) {

          if (itemAfter) {
            itemAfter.before(todoItem);
          } else {
            this.todoCompleted.append(todoItem);
          }

        } else {

          if (itemAfter) {
            itemAfter.before(todoItem);
          } else {
            this.todoList.append(todoItem);
          }
        }
        this.itemCompletedAnim(todoItem);
      });
  }

  handler() {
    const todoContainer = document.querySelector('.todo-container');

    todoContainer.addEventListener('click', e => {
      const target = e.target;
      if (target.classList.contains('todo-remove')) {
        this.deleteItem(target);
      } else if (target.classList.contains('todo-edit')) {
        this.editItem(target);
      } else if (target.classList.contains('todo-complete')) {
        this.completedItem(target);
      }
    });
  }

  init() {
    this.form.addEventListener('submit', this.addTodo.bind(this));
    this.handler();
    this.render();
  }

}

const todo = new ToDo('.todo-control', '.header-input', '.todo-list', '.todo-completed');
todo.init();
