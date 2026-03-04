import { rules } from "../lib/compare.js";

/**
 * Инициализирует модуль поиска
 * @param {string} searchField - имя поля ('search')
 */
export function initSearching(searchField) {
  // Создаем правило поиска по нужным колонкам напрямую
  const searchRule = rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false);

  return (data, state) => {
    if (!data) return [];
    
    // Эмуляция правила skipEmptyTargetValues:
    // Если в поле поиска пусто или одни пробелы — возвращаем все данные
    const query = state[searchField];
    if (!query || query.trim() === '') {
      return data;
    }

    // Применяем правило поиска к массиву данных
    return data.filter(item => searchRule(item, state));
  };
}







