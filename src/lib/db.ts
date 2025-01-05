import Dexie, { Table } from 'dexie';
import type { Manufacturer, Tag, Category, Puzzle } from './types';
import { DEFAULT_CATEGORIES, DEFAULT_MANUFACTURERS, DEFAULT_TAGS } from './constants';

class PuzzleDB extends Dexie {
  manufacturers!: Table<Manufacturer>;
  tags!: Table<Tag>;
  categories!: Table<Category>;
  puzzles!: Table<Puzzle>;

  constructor() {
    super('PuzzleDB');
    
    this.version(3001170).stores({
      manufacturers: '++id, name, country, countryCode',
      tags: '++id, name',
      categories: '++id, name',
      puzzles: '++id, name, manufacturer, pieces, difficulty'
    });

    // Přidáme upgrade hook pro inicializaci dat při vytvoření nové verze
    this.on('populate', () => {
      // Toto se spustí pouze při prvním vytvoření databáze
      return this.initializeDefaultData();
    });
  }

  async getManufacturerWithPuzzleCount() {
    const manufacturers = await this.manufacturers.toArray();
    const puzzles = await this.puzzles.toArray();

    return manufacturers.map(manufacturer => ({
      ...manufacturer,
      puzzleCount: puzzles.filter(p => p.manufacturer === manufacturer.name).length
    }));
  }

  async getTagsWithPuzzleCount() {
    const tags = await this.tags.toArray();
    const puzzles = await this.puzzles.toArray();

    return tags.map(tag => ({
      ...tag,
      puzzleCount: puzzles.filter(p => p.tags.includes(tag.name)).length
    }));
  }

  async getCategoriesWithPuzzleCount() {
    const categories = await this.categories.toArray();
    const puzzles = await this.puzzles.toArray();

    return categories.map(category => ({
      ...category,
      puzzleCount: puzzles.filter(p => p.categories.includes(category.name)).length
    }));
  }

  async initializeDefaultData() {
    try {
      // Inicializace výrobců
      const existingManufacturers = await this.manufacturers.toArray();
      
      // Přidáme všechny výchozí výrobce, kteří ještě neexistují
      for (const defaultManufacturer of DEFAULT_MANUFACTURERS) {
        const exists = existingManufacturers.some(m => m.name === defaultManufacturer.name);
        if (!exists) {
          await this.manufacturers.add(defaultManufacturer);
        }
      }

      // Aktualizujeme existující výrobce o chybějící údaje
      for (const existingManufacturer of existingManufacturers) {
        const defaultManufacturer = DEFAULT_MANUFACTURERS.find(m => m.name === existingManufacturer.name);
        if (defaultManufacturer && (!existingManufacturer.country || !existingManufacturer.countryCode)) {
          await this.manufacturers.update(existingManufacturer.id!, {
            country: defaultManufacturer.country,
            countryCode: defaultManufacturer.countryCode
          });
        }
      }

      // Inicializace kategorií
      const existingCategories = await this.categories.toArray();
      const existingCategoryNames = new Set(existingCategories.map(c => c.name));
      const newCategories = DEFAULT_CATEGORIES.filter(
        category => !existingCategoryNames.has(category.name)
      );
      if (newCategories.length > 0) {
        await this.categories.bulkAdd(newCategories);
      }

      // Inicializace štítků
      const existingTags = await this.tags.toArray();
      const existingTagNames = new Set(existingTags.map(t => t.name));
      const newTags = DEFAULT_TAGS.filter(
        tag => !existingTagNames.has(tag.name)
      );
      if (newTags.length > 0) {
        await this.tags.bulkAdd(newTags);
      }
    } catch (error) {
      console.error('Chyba při inicializaci dat:', error);
      throw error;
    }
  }
}

export const db = new PuzzleDB();