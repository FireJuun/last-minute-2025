# Last Minute Board Games NYE Settings

A simple, RSVP web application for a board game party on New Year's Eve 2025. Built with React, Vite, Tailwind CSS, and powered by Firebase Firestore.

## Features
- **Countdown Timer** to NYE 2026.
- **RSVP Form**: Guests can sign up with their name, email, headcount (adults/children), and game preferences.
- **Privacy Focused**: The guest list visuals only show the *total count* of attendees, hiding individual names from the public UI.
- **Dietary Restrictions**: Optional field for guests to mention allergies.

## Setup & Running Locally

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd last-minute-2025
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a file `src/firebaseConfig.js`.
   - Paste your Firebase configuration export (ensure it matches the structure in `src/App.jsx` imports).
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     // ...
   };
   export default firebaseConfig;
   ```

4. **Run Dev Server**
   ```bash
   npm run dev
   ```

## Deployment

The project is configured for GitHub Pages.

```bash
npm run deploy
```
This runs the build script and pushes the `dist` folder to the `gh-pages` branch.

## Firebase Security Rules

For this application to function without a backend while preventing vandalism:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rsvps/{rsvp} {
      // Allow creation if the user is authenticated (Anonymous Auth)
      allow create: if request.auth != null;
      
      // Allow reading so the "Total Attendees" counter works
      allow read: if request.auth != null;
      
      // Prevent deleting or modifying existing RSVPs
      allow update, delete: if false;
    }
  }
}
```

## License

This project is licensed under the FSL-1.1-ALv2 -- FSL 1.1, Apache License version 2.0 -- see the [LICENSE.md](LICENSE.md) file for details.
