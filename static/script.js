document.addEventListener('DOMContentLoaded', () => {
    const taskListUl = document.getElementById('taskList');
    const taskForm = document.getElementById('taskForm'); // Updated form ID
    const formTitle = document.getElementById('formTitle');
    const submitButton = document.getElementById('submitButton');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const editTaskIdInput = document.getElementById('editTaskId');

    const nameInput = document.getElementById('name');
    const descriptionInput = document.getElementById('description');
    const statusInput = document.getElementById('status');
    const priorityInput = document.getElementById('priority');
    const dependenciesInput = document.getElementById('dependencies');

    const API_BASE_URL = 'http://localhost:5000';
    let currentTasks = []; // To store fetched tasks globally

    async function fetchTasks() {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const tasks = await response.json();
            currentTasks = tasks; // Store tasks globally
            return tasks;
        } catch (error) {
            console.error("Error fetching tasks:", error);
            taskListUl.innerHTML = '<li>Error loading tasks. Check console for details.</li>';
            currentTasks = [];
            return [];
        }
    }

    function populateEditForm(taskId) {
        const task = currentTasks.find(t => t.id === taskId);
        if (!task) {
            console.error("Task not found for editing:", taskId);
            return;
        }

        formTitle.textContent = 'Edit Task';
        nameInput.value = task.name;
        descriptionInput.value = task.description;
        statusInput.value = task.status;
        priorityInput.value = task.priority;
        dependenciesInput.value = task.dependencies ? task.dependencies.join(', ') : '';
        editTaskIdInput.value = task.id;
        submitButton.textContent = 'Save Changes';
        cancelEditButton.style.display = 'inline-block';
        window.scrollTo(0, 0); // Scroll to top to see the form
    }
    
    // Make populateEditForm globally available
    window.populateEditForm = populateEditForm;

    function resetForm() {
        formTitle.textContent = 'Add New Task';
        taskForm.reset(); // Resets all form fields
        editTaskIdInput.value = '';
        submitButton.textContent = 'Add Task';
        cancelEditButton.style.display = 'none';
    }

    cancelEditButton.addEventListener('click', resetForm);

    function renderTasks(tasks) {
        taskListUl.innerHTML = ''; 
        if (!tasks || tasks.length === 0) {
            taskListUl.innerHTML = '<li>No tasks found.</li>';
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.setAttribute('data-task-id', task.id);
            
            let dependenciesText = 'None';
            if (task.dependencies && task.dependencies.length > 0) {
                dependenciesText = task.dependencies.join(', ');
            }

            li.innerHTML = `
                <div class="task-details">
                    <h3>${task.name} (ID: ${task.id})</h3>
                    <p><strong>Description:</strong> ${task.description}</p>
                    <p><strong>Status:</strong> ${task.status}</p>
                    <p><strong>Priority:</strong> ${task.priority}</p>
                    <p><strong>Dependencies:</strong> ${dependenciesText}</p>
                    <p><strong>Created:</strong> ${new Date(task.created_at).toLocaleString()}</p>
                    <p><strong>Updated:</strong> ${new Date(task.updated_at).toLocaleString()}</p>
                    <div class="task-actions">
                        <button class="edit-btn" onclick="populateEditForm('${task.id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
                    </div>
                </div>
            `;
            taskListUl.appendChild(li);
        });
    }

    async function loadTasks() {
        const tasks = await fetchTasks(); // This now also updates currentTasks
        renderTasks(tasks);
    }

    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = nameInput.value;
        const description = descriptionInput.value;
        const status = statusInput.value || '未進行';
        const priority = priorityInput.value || '中';
        const dependenciesRaw = dependenciesInput.value;
        
        let dependencies = [];
        if (dependenciesRaw.trim() !== '') {
            dependencies = dependenciesRaw.split(',').map(dep => dep.trim()).filter(dep => dep !== '');
        }

        const taskData = { name, description, status, priority, dependencies };
        const currentEditId = editTaskIdInput.value;

        if (currentEditId) { // Edit mode
            try {
                const response = await fetch(`${API_BASE_URL}/tasks/${currentEditId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Update failed'}`);
                }
                await response.json(); // Updated task
                resetForm();
                loadTasks(); // Refresh the list
            } catch (error) {
                console.error("Error updating task:", error);
                alert(`Error updating task: ${error.message}`);
            }
        } else { // Add mode
            try {
                const response = await fetch(`${API_BASE_URL}/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Add failed'}`);
                }
                await response.json(); // Created task
                resetForm(); // Resets form for next entry
                loadTasks(); // Refresh the list
            } catch (error) {
                console.error("Error adding task:", error);
                alert(`Error adding task: ${error.message}`);
            }
        }
    });

    window.deleteTask = async (taskId) => {
        if (!confirm(`Are you sure you want to delete task ${taskId}?`)) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Delete failed'}`);
            }
            await response.json(); // Success message
            if (editTaskIdInput.value === taskId) { // If deleting the task currently in edit form
                resetForm();
            }
            loadTasks(); // Refresh the list
        } catch (error) {
            console.error("Error deleting task:", error);
            alert(`Error deleting task: ${error.message}`);
        }
    };

    // Initial load of tasks
    loadTasks();
});
