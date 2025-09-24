# MovieExplorerApp  

A cross-platform Movie Explorer app built with **React Native (Expo)** that lets users:  

- Sign up & log in (Firebase Auth)  
- Browse trending movies & TV shows (TMDB API)  
- View details and metadata  
- Save favorites & watchlist (Firestore + local storage fallback)    
- Enjoy Dark/Light themes  

---

## Demo
![MovieExplorerApp Demo]([https://private-user-images.githubusercontent.com/111259015/493191909-fad52b63-cf52-4e3e-bf8c-d9ccb2a90202.gif](https://private-user-images.githubusercontent.com/111259015/493191909-fad52b63-cf52-4e3e-bf8c-d9ccb2a90202.gif?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTg2OTg2MTksIm5iZiI6MTc1ODY5ODMxOSwicGF0aCI6Ii8xMTEyNTkwMTUvNDkzMTkxOTA5LWZhZDUyYjYzLWNmNTItNGUzZS1iZjhjLWQ5Y2NiMmE5MDIwMi5naWY_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwOTI0JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDkyNFQwNzE4MzlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1kODE0N2U5NjNiNDk1MmU2Y2VkYzMxNjU5YTJmOGRkMWQ3M2VhZjgxMGI0MTk3ZDYzOTVmYzI0OGQxNGNhZjFmJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.vA8jVeQfVVy7rRs2O85JnxolVgNqwDjA7MPLvrZo4wI))

---

## Features  

- **Authentication** with Firebase (sign up, login, logout)  
- **Responsive layout** with Expo Router (web + mobile)  
- **Search overlay** with autocomplete  
- **Favorites & watchlist** synced via Firestore  
- **Offline persistence** with Firebase storage  
- **Adaptive UI**  
  - Top navigation bar for **web**  
  - Drawer + bottom tabs for **mobile**  
- **Custom theming** with context (light/dark) 

---

## Tech Stack  

- **Frontend:** React Native, Expo, TypeScript  
- **Navigation:** Expo Router  
- **State/Context:** Context API (Theme + Auth)  
- **Backend:** Firebase (Auth, Firestore, Storage)  
- **APIs:** [TMDB API](https://www.themoviedb.org/documentation/api)  
- **Styling:** React Native Stylesheet + Safe Area Context  

---

## Project Structure  

```bash
MovieExplorer/
├── app/               # Expo Router pages (/, /movies, /tvShows, /myList, /settings, /login, /signup)
├── components/        # Reusable UI components (e.g., SearchOverlay)
├── contexts/          # Theme + Auth providers
├── firebase/          # Firebase config & service worker
├── public/            # Static assets (web)
├── functions/         # Firebase Cloud Functions
├── models/            # TypeScript models
└── services/          # API + Firestore logic
```

---

## Quick Start
# 1. Clone repo
git clone https://github.com/16Ric/MovieExplorerApp

# 2. Install dependencies
npm install

# 3. Start development
npm run start

# 4. Run on web
npm run web
or
npx expo start --web

# 5. Run on device (Expo Go)
npm run android
npm run ios

---

## Author

Erich Wiguna
- GitHub: https://github.com/16Ric/
- LinkedIn: [Erich Wiguna](https://www.linkedin.com/in/erich-wiguna-764b70333/)


