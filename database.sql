CREATE TABLE IF NOT EXISTS folders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clientName VARCHAR(255) NOT NULL,
    constructionSite VARCHAR(255),
    description TEXT,
    projectRef VARCHAR(255),
    phone VARCHAR(50),
    thirdParty VARCHAR(255),
    projectDate VARCHAR(50),
    notes TEXT,
    projectCode VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'Da Iniziare',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folderId INT,
    name VARCHAR(255),
    type VARCHAR(100),
    size BIGINT,
    path VARCHAR(255),
    category VARCHAR(100),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folderId) REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

INSERT IGNORE INTO categories (name) VALUES 
('Documentazione Tecnica'),
('Amministrazione'),
('Corrispondenza'),
('Foto e Media'),
('Disegni'),
('Altro');

CREATE INDEX idx_folders_clientName ON folders(clientName);
CREATE INDEX idx_folders_constructionSite ON folders(constructionSite);
CREATE INDEX idx_files_folderId ON files(folderId);
