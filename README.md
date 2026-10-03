# Blueprint AI

**AI-Powered Software Architecture & Project Blueprint Generator**

Blueprint AI is a MERN-stack web application that helps developers and students transform project requirements into structured software blueprints using Artificial Intelligence.

## 🌐 Live Website

**[Open Blueprint AI](https://blueprint-ai-bay.vercel.app/)**

## 📌 About the Project

Planning a software project often requires developers to manually decide the system architecture, modules, database structure, APIs, file organization, and development steps.

Blueprint AI simplifies this process by allowing users to enter their project requirements and generate a structured software blueprint with the help of AI.

The application provides an organized view of the generated architecture and development information in one place.

## ✨ Features

* 🔐 User Registration and Login
* 📊 Dashboard for managing projects
* ➕ Create new software projects
* 🤖 AI-powered blueprint generation
* 🏗️ System Architecture generation
* 📦 Project Modules generation
* 🗄️ Database Design generation
* 🔌 API Design generation
* 🗺️ Development Roadmap generation
* 🌳 Interactive Architecture / File Structure Visualization
* 📋 Development Task List
* ✅ Task completion tracking
* 📄 Blueprint PDF Download
* 💾 Project and blueprint data stored in MongoDB
* 🔒 JWT-based authentication

## 🧠 AI-Generated Blueprint

For each project, Blueprint AI can generate:

### System Architecture

Provides a structured overview of the proposed software architecture and project file structure.

### Project Modules

Identifies the major modules/components required for the project.

### Database Design

Provides the recommended database structure and entities.

### API Design

Suggests the required API endpoints and their purposes.

### Development Roadmap

Breaks the project development process into organized tasks and stages.

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* React Router
* Axios
* Lucide React
* jsPDF
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Google Gemini API

### Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

## 🏗️ Project Structure

```text
BlueprintAI/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── package-lock.json
```

## 🔄 Application Flow

```text
User
  ↓
React Frontend
  ↓
Express / Node.js Backend
  ↓
Google Gemini API
  ↓
Generated Blueprint
  ↓
MongoDB Atlas
  ↓
Blueprint displayed in React
```

## 🔐 Authentication

Blueprint AI uses authentication to protect user projects.

The application uses:

* User registration
* User login
* JWT authentication
* Protected project operations

Authentication tokens are used by the frontend when communicating with the backend.

## 💾 Database

MongoDB Atlas is used as the application's database.

The main collections include:

* `users` — stores registered user information
* `blueprints` — stores project information and generated blueprint data

## 🚀 Deployment

The application is deployed using separate frontend and backend services.

**Frontend:** Vercel

**Backend:** Render

**Database:** MongoDB Atlas

The React frontend communicates with the deployed Express backend through the configured API URL.

## 📄 Blueprint PDF

Users can download the generated blueprint as a PDF containing information such as:

* Project Information
* System Architecture
* Project Modules
* Database Design
* API Design
* Development Roadmap

## 🎯 Project Objective

The main objective of Blueprint AI is to reduce the time and effort required during the software planning phase by providing an AI-assisted approach to architecture and project planning.

It is designed especially for students, developers, and teams who want to quickly organize software requirements into a structured development blueprint.

## 🔗 Links

* **Live Website:** https://blueprint-ai-bay.vercel.app/
* **GitHub Repository:** https://github.com/tinaparia-21/BlueprintAI

## 👩‍💻 Project

**Blueprint AI**

An academic MERN-stack project demonstrating AI-assisted software architecture and project planning.
