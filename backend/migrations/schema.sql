-- Schema PostgreSQL pour l'application de gestion des cotisations
-- Création des tables principales

-- Table des adhérents
CREATE TABLE IF NOT EXISTS adherents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des cotisations
CREATE TABLE IF NOT EXISTS cotisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des cotisations mensuelles
CREATE TABLE IF NOT EXISTS cotisations_mensuelles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adherent_id UUID NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    cotisation_id UUID NOT NULL REFERENCES cotisations(id) ON DELETE CASCADE,
    annee INTEGER NOT NULL,
    moyenne_cotisation DECIMAL(10,2) DEFAULT 0,
    mois JSONB NOT NULL DEFAULT '{
        "janvier": 0, "fevrier": 0, "mars": 0, "avril": 0,
        "mai": 0, "juin": 0, "juillet": 0, "aout": 0,
        "septembre": 0, "octobre": 0, "novembre": 0, "decembre": 0
    }',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(adherent_id, cotisation_id, annee)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_adherents_nom ON adherents(nom, prenom);
CREATE INDEX IF NOT EXISTS idx_cotisations_nom ON cotisations(nom);
CREATE INDEX IF NOT EXISTS idx_cotisations_mensuelles_adherent ON cotisations_mensuelles(adherent_id);
CREATE INDEX IF NOT EXISTS idx_cotisations_mensuelles_cotisation ON cotisations_mensuelles(cotisation_id);
CREATE INDEX IF NOT EXISTS idx_cotisations_mensuelles_annee ON cotisations_mensuelles(annee);
CREATE INDEX IF NOT EXISTS idx_cotisations_mensuelles_adherent_annee ON cotisations_mensuelles(adherent_id, annee);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at (DROP IF EXISTS puis CREATE pour éviter les conflits)
DROP TRIGGER IF EXISTS update_adherents_updated_at ON adherents;
DROP TRIGGER IF EXISTS update_cotisations_updated_at ON cotisations;
DROP TRIGGER IF EXISTS update_cotisations_mensuelles_updated_at ON cotisations_mensuelles;

CREATE TRIGGER update_adherents_updated_at BEFORE UPDATE ON adherents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cotisations_updated_at BEFORE UPDATE ON cotisations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cotisations_mensuelles_updated_at BEFORE UPDATE ON cotisations_mensuelles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
