# MovieExplorerApp  

A cross-platform Movie Explorer app built with **React Native (Expo)** that lets users:  

- Sign up & log in (Firebase Auth)  
- Browse trending movies & TV shows (TMDB API)  
- View details and metadata  
- Save favorites & watchlist (Firestore + local storage fallback)    
- Enjoy Dark/Light themes  

---

## 📸 Demo  
 

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

# 5. Run on device (Expo Go)
npm run android
npm run ios

---

## Author

Erich Wiguna
- GitHub: https://github.com/16Ric/
- LinkedIn: [Erich Wiguna](https://www.linkedin.com/in/erich-wiguna-764b70333/)


