from flask import Flask, request, jsonify
from task_manager import TaskManager

app = Flask(__name__, static_folder='static') # Explicitly set static folder
task_manager_instance = TaskManager()

# Serve static index.html from the root
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/tasks', methods=['POST'])
def create_task_endpoint():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON payload"}), 400

        name = data.get('name')
        description = data.get('description')

        if not name or not description:
            return jsonify({"error": "Missing required fields: name and description"}), 400

        # Optional fields
        status = data.get('status', '未進行') # Default value if not provided
        priority = data.get('priority', '中') # Default value if not provided
        dependencies = data.get('dependencies', []) # Default to empty list

        if not isinstance(dependencies, list):
            return jsonify({"error": "Field 'dependencies' must be a list of task IDs"}), 400


        task = task_manager_instance.create_task(
            name=name,
            description=description,
            status=status,
            priority=priority,
            dependencies=dependencies
        )
        return jsonify(task), 201
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

@app.route('/tasks', methods=['GET'])
def get_all_tasks_endpoint():
    try:
        tasks = task_manager_instance.get_tasks()
        return jsonify(tasks), 200
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

@app.route('/tasks/<string:task_id>', methods=['GET'])
def get_task_endpoint(task_id):
    try:
        task = task_manager_instance.get_tasks(task_id)
        if task:
            return jsonify(task), 200
        else:
            return jsonify({"error": f"Task with ID '{task_id}' not found"}), 404
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

@app.route('/tasks/<string:task_id>', methods=['PUT'])
def update_task_endpoint(task_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON payload or empty update data"}), 400

        # Ensure dependencies, if provided, is a list
        if 'dependencies' in data and not isinstance(data['dependencies'], list):
            return jsonify({"error": "Field 'dependencies' must be a list of task IDs"}), 400

        updated_task = task_manager_instance.update_task(task_id, **data)
        if updated_task:
            return jsonify(updated_task), 200
        else:
            # Check if the task exists at all, update_task returns None if not found
            if task_manager_instance.get_tasks(task_id) is None:
                 return jsonify({"error": f"Task with ID '{task_id}' not found"}), 404
            # If task exists but update failed for other reasons (though current update_task doesn't have such cases)
            # For now, this path might not be hit if update_task only returns None for "not found"
            return jsonify({"error": f"Failed to update task with ID '{task_id}'"}), 400

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

@app.route('/tasks/<string:task_id>', methods=['DELETE'])
def delete_task_endpoint(task_id):
    try:
        deleted = task_manager_instance.delete_task(task_id)
        if deleted:
            return jsonify({"message": f"Task with ID '{task_id}' deleted successfully"}), 200
        else:
            return jsonify({"error": f"Task with ID '{task_id}' not found"}), 404
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

if __name__ == '__main__':
    # Make sure to install Flask and PyYAML: pip install Flask PyYAML
    app.run(debug=True, host='0.0.0.0', port=5000)
