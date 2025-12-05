import { useResume } from '../context/ResumeContext';
import { v4 as uuidv4 } from 'uuid';
import type { Resume } from '../types';

/**
 * Generic hook for managing resume sections
 * Eliminates repetitive CRUD code across all section components
 */
export function useSection<T extends { id: string }>(sectionId: keyof Resume) {
    const { resume, dispatch } = useResume();

    // Get the section data with proper typing
    const items = (resume[sectionId] as T[]) || [];

    // Add new item to section
    const addItem = (item: Omit<T, 'id'>) => {
        dispatch({
            type: 'ADD_ITEM',
            payload: {
                sectionId,
                item: { ...item, id: uuidv4() },
            },
        });
    };

    // Delete item from section
    const deleteItem = (itemId: string) => {
        dispatch({
            type: 'DELETE_ITEM',
            payload: { sectionId, itemId },
        });
    };

    // Update item in section
    const updateItem = (itemId: string, updates: Partial<T>) => {
        dispatch({
            type: 'UPDATE_ITEM',
            payload: {
                sectionId,
                itemId,
                item: updates,
            },
        });
    };

    // Update specific field in item
    const updateField = (itemId: string, field: keyof T, value: any) => {
        updateItem(itemId, { [field]: value } as Partial<T>);
    };

    return {
        items,
        addItem,
        deleteItem,
        updateItem,
        updateField,
    };
}

/**
 * Hook specifically for sections with bullet points (Experience, Projects)
 */
export function useBulletSection<T extends { id: string; description: string[] }>(
    sectionId: keyof Resume
) {
    const base = useSection<T>(sectionId);

    // Add bullet to item
    const addBullet = (itemId: string) => {
        const item = base.items.find(i => i.id === itemId);
        if (!item) return;

        const newDescription = [...item.description, ''];
        base.updateField(itemId, 'description', newDescription);
    };

    // Remove bullet from item
    const removeBullet = (itemId: string, bulletIndex: number) => {
        const item = base.items.find(i => i.id === itemId);
        if (!item) return;

        const newDescription = item.description.filter((_, i) => i !== bulletIndex);
        base.updateField(itemId, 'description', newDescription);
    };

    // Update specific bullet
    const updateBullet = (itemId: string, bulletIndex: number, value: string) => {
        const item = base.items.find(i => i.id === itemId);
        if (!item) return;

        const newDescription = [...item.description];
        newDescription[bulletIndex] = value;
        base.updateField(itemId, 'description', newDescription);
    };

    return {
        ...base,
        addBullet,
        removeBullet,
        updateBullet,
    };
}
