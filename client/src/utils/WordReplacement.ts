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
    // 1. Load Book Specific
    const local = loadReplacements(id);

    // 2. Load Global
    const global = loadReplacements('global'); // 'wordReplacementMap_global'

    let processedText = originalText;

    // Apply Global First (so local can potentially override if valid... 
    // actually, if global says changes "A"->"B", and local says "B"->"C", then "A"->"C".
    // If local says "A"->"D", then we apply global "A"->"B" (now "B"), then local "A"->"D" (no match). 
    // Is that what we want?
    // Usually local should take precedence for the *same* pattern. 
    // But since these are lists of rules, merging them intelligently is hard without checking collision.
    // simpler approach: Apply Global Rules, THEN Apply Local Rules. 
    // If Global has A->B, text becomes B. Local has A->C, it won't match anymore. 
    // If user wants A->C in this book, they should ensure Global A->B doesn't run? 
    // Or maybe we treat them as a single list where Local comes first? 
    // Let's chain them: Global replacements first (general cleanup), then Local replacements (specific overrides/fixes).

    if (global.mapList.length > 0) {
        processedText = applyReplacements(processedText, global.mapList, global.regexMode);
    }

    if (local.mapList.length > 0) {
        processedText = applyReplacements(processedText, local.mapList, local.regexMode);
    }

    return processedText;
};