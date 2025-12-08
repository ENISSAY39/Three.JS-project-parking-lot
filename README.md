Three.js Parking Lot – Teknik Informatika Project
📌 Final Project – Computer Graphics
🧑‍💻 Author: Gharbi Yassine (ENISSAY39)
🏫 Institut Teknologi Sepuluh Nopember (ITS)
🚗 Project Overview

This project is a 3D interactive visualization of the Teknik Informatika parking lot, created entirely with Three.js.
It includes procedural textures, realistic lighting and shadows, a metal-roof parking shelter, trees, cars, curb markings, and a skybox.

The goal is to demonstrate core computer graphics concepts using WebGL & JavaScript.

✨ Features

✔ Procedural brick texture for the building
✔ Procedural paver texture for the ground
✔ Procedural sky with clouds (CanvasTexture)
✔ Metal lamella roof structure (parking shelter)
✔ Parking slot markings (auto-generated)
✔ Cars (simplified low-poly model)
✔ Trees & environment objects
✔ Curb sections (yellow/black)
✔ Speed bump (ExtrudeGeometry)
✔ OrbitControls exploration
✔ Real-time shadows (DirectionalLight + AmbientLight)

📁 Project Structure
Three.JS-project-parking-lot/
├── lib/               # OrbitControls and dependencies
├── node_modules/
├── index.html         # Entry point
├── script.js          # Main Three.js scene
├── style.css          # Page styling
├── package.json
└── README.md

▶️ How to Run the Project
1. Install dependencies
npm install

2. Fix PowerShell permission error (Windows only)

If "scripts cannot be executed", run:

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

3. Start the development server
npm run dev

The project will open at:
http://localhost:3000

🖼️ Preview

(Optional: add a screenshot later)

📦 Technologies Used

Three.js

JavaScript (ES Modules)

CanvasTexture / WebGL

Vite / NPM

📜 License

This project is open-source.
Feel free to fork, study, or improve it.
