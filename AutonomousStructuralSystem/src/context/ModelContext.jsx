import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ModelContext = createContext();

export const useModelContext = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModelContext must be used within a ModelProvider');
    }
    return context;
};

export const ModelProvider = ({ children }) => {
    const [savedModels, setSavedModels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/models');
                if (res.data) {
                    // Adapt backend model structure to the context's expected structure if needed
                    const adaptedModels = res.data.map(m => ({
                        ...m,
                        walls: m.walls || [],
                        doors: m.doors || []
                    }));
                    setSavedModels(adaptedModels);
                }
            } catch (err) {
                console.error("Hydration failed (Backend offline?):", err);
            } finally {
                setLoading(false);
            }
        };
        fetchModels();
    }, []);

    const saveNewModel = async (name, walls, doors) => {
        const newId = crypto.randomUUID();
        const date = new Date().toLocaleDateString();
        
        // Unify elements for storage
        const allElements = [...walls, ...doors];

        const newModel = {
            id: newId,
            name: name || 'Untitled Render',
            date: date,
            walls: allElements, // Stored as walls_json in DB
            thumbnail: "https://placehold.co/400x500/FFFFFF/000000?text=Architectural+Draft"
        };

        try {
            await axios.post('http://localhost:8000/api/models', newModel);
            setSavedModels(prev => [...prev, newModel]);
        } catch (e) {
            console.error("Sync failed, saving locally only", e);
            setSavedModels(prev => [...prev, newModel]);
        }
        
        return newId;
    };

    const updateExistingModel = async (id, walls, doors) => {
        const allElements = [...walls, ...doors];
        const existingModel = savedModels.find(m => m.id === id);
        
        const updatedModel = {
            ...existingModel,
            walls: allElements
        };

        try {
            await axios.post('http://localhost:8000/api/models', updatedModel);
            setSavedModels(prev => prev.map(model => 
                model.id === id ? updatedModel : model
            ));
        } catch (e) {
            console.error("Update failed", e);
            // Fallback to local state update
            setSavedModels(prev => prev.map(model => 
                model.id === id ? updatedModel : model
            ));
        }
    };

    return (
        <ModelContext.Provider value={{ 
            savedModels, 
            saveNewModel, 
            updateExistingModel,
            loading 
        }}>
            {children}
        </ModelContext.Provider>
    );
};
