# AI-Powered TODO Application

This is a simple TODO application that allows users to manage tasks through a web interface. Task data is stored in a `tasks.yaml` file in the project directory. This project is being developed with the assistance of an AI agent.

## Features Implemented
*   **Task Management:** Create, Read, Update, and Delete tasks.
*   **Detailed Task Attributes:** Tasks include name, description, status (e.g., 未進行, 進行中, 完了), priority (e.g., 高, 中, 低), and dependencies on other tasks.
*   **Data Persistence:** Tasks are saved to and loaded from a `tasks.yaml` file.
*   **Web Interface:** A basic web UI to interact with tasks (view, add, edit, delete).
*   **API Backend:** A Flask-based API provides endpoints for task management.

## Technology Selection Rationale

The technologies for this project were chosen for simplicity, ease of development, and suitability for the project's scale:

*   **Backend (Python with Flask):**
    *   **Simplicity and Rapid Development:** Flask is a lightweight micro-framework, allowing for quick setup and development of web applications and APIs.
    *   **Python Ecosystem:** Leverages Python's extensive libraries and readable syntax, making development efficient.
    *   **Suitability for Smaller Projects:** Ideal for projects like this task manager that don't require the complexity of larger frameworks.

*   **Frontend (Vanilla JavaScript, HTML, CSS):**
    *   **Lightweight UI:** Standard web technologies were chosen to create a simple and responsive user interface without the overhead of larger frontend frameworks.
    *   **Direct DOM Manipulation:** Vanilla JavaScript is sufficient for the level of interactivity required, interacting directly with the Document Object Model (DOM).

*   **Data Storage (YAML File - `tasks.yaml`):**
    *   **Human-Readability:** YAML offers a simple, human-readable format for data, making it easy to inspect and manually edit if necessary.
    *   **Self-Contained:** Using a file for storage avoids the need for a separate database server, simplifying setup and deployment for this application's scale.
    *   **Ease of Use:** PyYAML library makes it straightforward to integrate YAML-based data persistence into the Python application.

*   **AI-Assisted Development:**
    *   The development process for this project is being assisted by an AI agent. This approach can accelerate development, help in exploring solutions, and aid in generating documentation and code.

## Local Setup and Running the Application

Follow these steps to run the application on your local machine:

1.  **Prerequisites:**
    *   Python 3 (Python 3.7 or newer recommended).
    *   `pip` (Python package installer).

2.  **Clone the Repository (if applicable):**
    If you have this project in a Git repository, clone it first:
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

3.  **Create and Activate a Virtual Environment (Recommended):**
    It's good practice to use a virtual environment to manage project dependencies.
    ```bash
    # For Windows
    python -m venv venv
    .+env\Scriptsctivate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

4.  **Install Dependencies:**
    Install the required Python packages using the `requirements.txt` file:
    ```bash
    pip install -r requirements.txt
    ```
    This will install Flask and PyYAML.

5.  **Run the Application:**
    Execute the `app.py` file to start the Flask development server:
    ```bash
    python app.py
    ```

6.  **Access the Application:**
    Once the server is running, you will see output similar to this:
    ```
     * Serving Flask app 'app'
     * Debug mode: on
     * Running on http://127.0.0.1:5000
    Press CTRL+C to quit
    ```
    Open your web browser and navigate to:
    [http://localhost:5000](http://localhost:5000) or [http://127.0.0.1:5000](http://127.0.0.1:5000)

    You should see the task manager web interface. Tasks will be stored in a `tasks.yaml` file created in the same directory as `app.py`.

## Project Structure
```
.
├── app.py             # Main Flask application, API endpoints
├── task_manager.py    # Task management logic (TaskManager class)
├── tasks.yaml         # Data file for tasks (created automatically)
├── requirements.txt   # Python dependencies
├── static/            # Static files for the web UI
│   ├── index.html     # Main HTML page
│   └── script.js      # JavaScript for UI interactivity
└── templates/         # Flask templates folder (currently unused)
```
