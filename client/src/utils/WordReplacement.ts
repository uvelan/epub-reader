// utils/replacementUtils.ts
import { ReplacementRule, StoredData } from '../types';

export const loadReplacements = (id: string): { mapList: ReplacementRule[]; regexMode: boolean } => {
    const localStorageKey = `wordReplacementMap_${id}`;
    const storedData = localStorage.getItem(localStorageKey);

    if (storedData) {
        try {
            const { mapList = [], regexMode = false }: StoredData = JSON.parse(storedData);
            return { mapList, regexMode };
        } catch (e) {
            console.error('Failed to parse replacement rules:', e);
        }
    }
    return { mapList: [], regexMode: false };
};

export const applyReplacements = (
    text: string[],
    rules: ReplacementRule[],
    regexMode: boolean
): string[] => {
    if (!text || !Array.isArray(text)) return [];
    if (!rules || !Array.isArray(rules)) return text;

    return text
        .map(sentence => {
            let result = sentence;
            rules.forEach(rule => {
                if (rule?.key?.trim()) {
                    try {
                        if (regexMode) {
                            const regex = new RegExp(rule.key, 'g');
                            result = result.replace(regex, rule.value || '');
                        } else {
                            result = result.split(rule.key).join(rule.value || '');
                        }
                    } catch (e) {
                        console.error(`Error applying replacement for "${rule.key}":`, e);
                    }
                }
            });
            return result;
        })
        .filter(sentence => {
            // Filter out empty or whitespace-only sentences
            return sentence.trim().length > 0;
        })
        .map(sentence => {
            // Clean up any unwanted whitespace
            return sentence.replace(/\s+/g, ' ').trim();
        });
};
export const processTextWithReplacements = (
    id: string,
    originalText: string[]
): string[] => {
    const { mapList, regexMode } = loadReplacements(id);
    return mapList.length > 0
        ? applyReplacements(originalText, mapList, regexMode)
        : originalText;
};