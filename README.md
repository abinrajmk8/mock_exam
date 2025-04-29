KEAM Mock Test
A professional mock test platform for KEAM preparation.
Overview
The KEAM Mock Test project is a comprehensive web-based application designed to help students prepare for the Kerala Engineering Architecture Medical (KEAM) entrance examination. It consists of a frontend built with React and a backend for managing questions and data. Questions are categorized by subjects (Physics, Chemistry, and Maths), fetched from a MongoDB database, and presented in an interactive interface with a modern dark theme inspired by professional dashboards. The project is hosted on GitHub at https://github.com/abinrajmk8/mock_exam.git.
Features

Dynamic Question Fetching: Questions are fetched from a MongoDB database via a backend API and categorized by subjects.
Shuffled Question Order: Questions are shuffled within each subject to simulate a real exam experience.
Interactive UI: 
Displays one question at a time with four selectable options.
Options are presented in bordered boxes for easy selection.
Navigation grid on the right to jump between questions (currently placeholder functionality).


Modern Dark Theme: Inspired by professional dashboard designs, using a slate color palette for better readability.
Responsive Design: Works on both desktop and mobile devices with a flexible layout.
Control Buttons: Includes "Previous", "Mark for Visit", "Clear", and "Next" buttons for navigation (functionality to be implemented).

Technologies Used

Frontend: React, Tailwind CSS
Backend: Node.js, Express
Database: MongoDB
HTTP Client: Axios for API requests
Routing: React Router for navigation
Environment: Dotenv for configuration

Project Structure
mock_exam/
├── frontend/               # Frontend source code
│   ├── public/             # Static assets
│   ├── src/                # React components, pages, and config
│   ├── package.json        # Frontend dependencies
├── backend/                # Backend source code
│   ├── config/             # Configuration files (e.g., db connection)
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
├── .env                    # Environment variables (e.g., MongoDB URL, port)
├── README.md               # Project documentation

Installation
To run the KEAM Mock Test project locally, follow these steps:
Prerequisites

Node.js (v14 or later)
MongoDB installed and running locally or accessible via a remote instance.

Setup

Clone the Repository:
git clone https://github.com/abinrajmk8/mock_exam.git
cd mock_exam


Configure Environment Variables:

Create a .env file in the root directory (mock_exam/).
Add the following variables:PORT=5000
MONGODB_URL=mongodb://localhost:27017/keam_mock_test


Replace mongodb://localhost:27017/keam_mock_test with your MongoDB connection string if using a remote database (e.g., MongoDB Atlas).
The PORT variable sets the backend server to run on port 5000 (adjust if needed).




Install Dependencies:

For the frontend:cd frontend
npm install


For the backend:cd ../backend
npm install




Run the Application:

Start the backend server:cd backend
npm start

The backend will run on http://localhost:5000.
Start the frontend development server:cd ../frontend
npm run dev

The app will be available at http://localhost:5173.



Usage

Access the Test:Open your browser and navigate to http://localhost:5173/test/6804a6a54bcf4a4370d68463 (or the route configured in your app).

Take the Mock Test:

The test loads questions from the MongoDB database via the backend API.
Each question has four options, presented in bordered boxes.
Use the navigation grid on the right to jump between questions (to be fully implemented).
Use the control buttons ("Previous", "Mark for Visit", "Clear", "Next") to navigate (functionality to be added).


Review and Submit:

Functionality for marking answers and submitting the test will be added in future updates.



Screenshots
The question panel with a modern slate theme and selectable options.
The right-side navigation grid for jumping between questions.
Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Make your changes and commit (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Create a pull request.

Please ensure your code follows the project's coding style and includes appropriate tests.
Roadmap

Add functionality for selecting and saving answers.
Implement navigation between questions using the "Previous" and "Next" buttons.
Sync the navigation grid with the current question.
Add a timer for the test duration.
Include a submission feature to calculate and display results.
Support for light theme toggle.
Add backend API documentation and setup instructions.

License
This project is licensed under the MIT License. See the LICENSE file for details.
Contact
For questions or feedback, please reach out to the project maintainer:  

Abin Raj  
GitHub: abinrajmk8  
Email: your-email@example.com


Built with ❤️ for KEAM aspirants by Abin Raj.
