# Fullstack Task 5 — To Do Planner 
### Internship Project — Cognify Technologies  

This project is a *personal planner and to-do manager* that helps users organize tasks on *daily, weekly, and monthly* bases using:

- HTML5  
- CSS3  
- JavaScript (vanilla)  
- Local storage (session persistence)  
- Optional backend API for task management  

It is designed for *students and employees* to efficiently track tasks and schedules.

---

## How to Run

1. Download or clone the repository  
2. Make sure index.html, style.css, and script.js are in the same folder  
3. Open index.html in any web browser  
4. Optional: run backend server (if API is enabled) at http://localhost:3000  
5. Enter your name and click *Prepare* to start using the planner  

---

## Features

- *Planner Modes*
  - Daily — tasks for a specific date  
  - Weekly — tasks for a specific weekday  
  - Monthly — tasks for a specific day of the month  

- *Task Management*
  - Add tasks with a title and optional due date / day / weekday  
  - Edit task titles dynamically  
  - Delete tasks  
  - Mark tasks as complete / incomplete  

- *User Persistence*
  - Saves current user in local storage  
  - Auto-login if user was previously saved  
  - Option to switch users  

- *Interactive UI*
  - Notebook-style sidebar for modes  
  - Dashboard shows tasks dynamically  
  - Responsive design for mobile and desktop  
  - Smooth transitions and visual feedback  

---

## Files Included

- index.html — main interface  
- style.css — styles for planner, tasks, and UI elements  
- script.js — handles DOM interactions, mode switching, and task CRUD  
- Optional backend: server.js for API-based task storage

---

## Notes

- Clicking *Prepare* initializes the planner for the entered user  
- Tasks can be managed independently for each mode  
- Frontend works without backend, but backend enables persistent task storage