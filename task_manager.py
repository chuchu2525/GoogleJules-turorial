import datetime
import yaml
import os

class TaskManager:
    def __init__(self):
        """
        Initializes the TaskManager, loading tasks from YAML if available.
        """
        self.yaml_file = "tasks.yaml"
        self.tasks = []
        self.next_id = 1
        self._load_tasks()

    def _load_tasks(self):
        """
        Loads tasks from the YAML file. If the file doesn't exist or is invalid,
        initializes with an empty list of tasks.
        """
        created_new_file = False
        if not os.path.exists(self.yaml_file):
            self.tasks = []
            self.next_id = 1
            # Create an empty file
            self._save_tasks() # ensure file is created
            created_new_file = True
            return

        try:
            with open(self.yaml_file, 'r') as f:
                data = yaml.safe_load(f)
                if data is None: # Empty file
                    self.tasks = []
                    self.next_id = 1
                    if not created_new_file: # Save only if we didn't just create it
                        self._save_tasks()
                    return

                # Ensure data is a list, otherwise treat as invalid
                if not isinstance(data, list):
                    print(f"Warning: {self.yaml_file} does not contain a valid list of tasks. Initializing with empty tasks.")
                    self.tasks = []
                    self.next_id = 1
                    if not created_new_file:
                         self._save_tasks() # Overwrite with empty list
                    return

                self.tasks = data
                if self.tasks:
                    max_id = 0
                    for task in self.tasks:
                        if isinstance(task, dict) and "id" in task and task["id"].startswith("task_"):
                            try:
                                num_part = int(task["id"].split("_")[1])
                                if num_part > max_id:
                                    max_id = num_part
                            except (IndexError, ValueError):
                                # Invalid task ID format, ignore for max_id calculation
                                pass
                    self.next_id = max_id + 1
                else:
                    self.next_id = 1
        except FileNotFoundError:
            self.tasks = []
            self.next_id = 1
            if not created_new_file: # Save only if we didn't just create it
                self._save_tasks()
        except yaml.YAMLError as e:
            print(f"Error loading YAML from {self.yaml_file}: {e}. Initializing with empty tasks.")
            self.tasks = []
            self.next_id = 1
            if not created_new_file: # Overwrite with empty list if error
                self._save_tasks()


    def _save_tasks(self):
        """
        Saves the current list of tasks to the YAML file.
        """
        try:
            with open(self.yaml_file, 'w') as f:
                yaml.dump(self.tasks, f, allow_unicode=True, sort_keys=False)
        except Exception as e:
            print(f"Error saving tasks to {self.yaml_file}: {e}")


    def create_task(self, name: str, description: str, status: str = "未進行", priority: str = "中", dependencies: list = None) -> dict:
        """
        Creates a new task with the given details.

        Args:
            name (str): The name of the task.
            description (str): A description of the task.
            status (str, optional): The status of the task. Defaults to "未進行".
            priority (str, optional): The priority of the task. Defaults to "中".
            dependencies (list, optional): A list of task IDs that this task depends on. Defaults to an empty list.

        Returns:
            dict: The created task dictionary.
        """
        if dependencies is None:
            dependencies = []

        task_id = f"task_{self.next_id}"
        self.next_id += 1

        now = datetime.datetime.utcnow().isoformat()

        task = {
            "id": task_id,
            "name": name,
            "description": description,
            "status": status,
            "priority": priority,
            "dependencies": dependencies,
            "created_at": now,
            "updated_at": now,
        }

        self.tasks.append(task)
        self._save_tasks()
        return task

    def get_tasks(self, task_id: str = None):
        """
        Retrieves tasks.

        Args:
            task_id (str, optional): The ID of the task to retrieve. If None, all tasks are returned.

        Returns:
            list or dict or None: A list of all tasks, a single task dictionary if task_id is found, or None if task_id is not found.
        """
        if task_id:
            for task in self.tasks:
                if task["id"] == task_id:
                    return task
            return None
        return self.tasks

    def update_task(self, task_id: str, **kwargs) -> dict | None:
        """
        Updates an existing task.

        Args:
            task_id (str): The ID of the task to update.
            **kwargs: Keyword arguments for the fields to update (e.g., name, description, status, priority, dependencies).

        Returns:
            dict or None: The updated task dictionary, or None if the task is not found.
        """
        task = self.get_tasks(task_id)
        if task:
            for key, value in kwargs.items():
                # Make sure not to update id, created_at
                if key in task and key not in ["id", "created_at"]:
                    task[key] = value
            task["updated_at"] = datetime.datetime.utcnow().isoformat()
            self._save_tasks()
            return task
        return None

    def delete_task(self, task_id: str) -> bool:
        """
        Deletes a task.

        Args:
            task_id (str): The ID of the task to delete.

        Returns:
            bool: True if the task was deleted, False otherwise.
        """
        task = self.get_tasks(task_id)
        if task:
            self.tasks.remove(task)
            self._save_tasks()
            return True
        return False
