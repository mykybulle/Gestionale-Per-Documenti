# 📂 Gestione Cartelline Cantieri

![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PHP](https://img.shields.io/badge/php-%23777BB4.svg?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

Un'applicazione web moderna e reattiva progettata per sostituire la gestione cartacea e basata su filesystem dei cantieri edili. Permette di organizzare, tracciare e archiviare digitalmente tutta la documentazione di cantiere con un'interfaccia intuitiva e veloce.

## ✨ Funzionalità Principali

*   **📊 Dashboard Interattiva**: Panoramica immediata dello stato dei cantieri (Da Iniziare, In Corso, Finite, Sospese).
*   **📁 Gestione Cartelline**: Creazione, modifica e archiviazione schede cantiere con dettagli completi (Cliente, Cantiere, Referenti, Note).
*   **📎 Archivio Digitale**: Upload di file (PDF, Immagini, DWG) per ogni cantiere, organizzati per categorie.
*   **🏷️ Categorie Dinamiche**: Sistema flessibile per creare e gestire categorie di documenti personalizzate.
*   **🔍 Ricerca Istantanea**: Filtra i cantieri per nome cliente, indirizzo o codice progetto in tempo reale.
*   **🌓 Modalità Scura**: Supporto nativo per tema Chiaro/Scuro per ridurre l'affaticamento visivo.
*   **📱 Responsive Design**: Ottimizzato per l'uso su Desktop, Tablet e Smartphone.

---

## 🛠️ Stack Tecnologico

Il progetto utilizza un'architettura **disaccoppiata** per garantire la massima compatibilità con hosting condivisi (es. Plesk) pur mantenendo un frontend moderno.

### Frontend (SPA)
*   **Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Linguaggio**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icone**: [Lucide React](https://lucide.dev/)
*   **Routing**: React Router (HashRouter per compatibilità server)

### Backend (API)
*   **Linguaggio**: PHP (Vanilla, no framework)
*   **Database**: MySQL / MariaDB
*   **Comunicazione**: RESTful JSON API

---

## 🚀 Installazione e Deploy

### Prerequisiti
*   Node.js & npm (per la build del frontend)
*   Server Web (Apache/Nginx) con PHP 7.4+
*   Database MySQL/MariaDB

### 1. Sviluppo Locale

1.  **Clona il repository**:
    ```bash
    git clone https://github.com/mykybulle/Gestionale-Per-Documenti.git
    cd gestione-cartelline
    ```

2.  **Installa le dipendenze frontend**:
    ```bash
    npm install
    ```

3.  **Configura il Backend**:
    *   Crea un database MySQL locale.
    *   Importa il file `database.sql`.
    *   Configura `public/api/config.php` con le tue credenziali locali.
    *   Avvia un server PHP nella cartella `public` (es. con XAMPP o `php -S localhost:3002 -t public`).

4.  **Avvia il Frontend**:
    ```bash
    npm run dev
    ```

### 2. Deploy in Produzione (Plesk/cPanel)

Questo progetto è ottimizzato per il deploy su hosting condivisi come Plesk senza necessità di Node.js sul server.

1.  **Build del Progetto**:
    Genera i file statici ottimizzati per la produzione.
    ```bash
    npm run build
    ```

2.  **Setup Database**:
    *   Crea un nuovo database su Plesk.
    *   Importa il file `database.sql` tramite phpMyAdmin.
    *   (Opzionale) Importa `seed.sql` se vuoi dei dati di prova.

3.  **Upload dei File**:
    *   Carica **tutto il contenuto** della cartella `dist/` nella root del tuo sito (es. `httpdocs`).

4.  **Configurazione Finale**:
    *   Modifica il file `api/config.php` sul server inserendo i dati del database di produzione:
        ```php
        define('DB_HOST', 'localhost');
        define('DB_USER', 'tuo_utente_plesk');
        define('DB_PASS', 'tua_password_sicura');
        define('DB_NAME', 'tuo_db_name');
        ```
    *   Assicurati che la cartella `uploads/` abbia i permessi di scrittura (755 o 777).

---

## 📂 Struttura del Progetto

```
gestione-cartelline/
├── public/              # File statici e Backend PHP
│   ├── api/             # Endpoint API PHP
│   │   ├── config.php   # Connessione DB
│   │   ├── folders.php  # API Cartelline
│   │   └── ...
│   └── uploads/         # Cartella destinazione file caricati
├── src/                 # Codice Sorgente Frontend
│   ├── components/      # Componenti React riutilizzabili
│   ├── lib/             # Logica API client-side
│   ├── pages/           # Pagine dell'applicazione
│   └── types/           # Definizioni TypeScript
├── database.sql         # Schema Database
├── seed.sql             # Dati di esempio
└── vite.config.ts       # Configurazione Build
```

---

## 📝 Note per lo Sviluppatore

*   **Routing**: L'app usa `HashRouter` (`/#/pagina`) per evitare problemi di configurazione dei rewrite rule su server Apache/Nginx standard.
*   **CORS**: Gli script PHP includono già gli header CORS necessari per lo sviluppo locale.
*   **Error Handling**: Il backend restituisce errori in formato JSON standard per essere gestiti facilmente dal frontend.

---

Made with ❤️ for Framas Impianti By Bulleri Michael
