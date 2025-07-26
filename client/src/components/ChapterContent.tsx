import React, { useEffect, useRef, useState } from 'react';

const chapterContentStyle: React.CSSProperties = {
    height: '75vh',
    backgroundColor: '#f5f1e9',
    color: '#5b4636',
    border: '1px solid #b7a88e',
    borderRadius: '8px',
    padding: '20px',
    fontFamily: "'Georgia', serif",
    fontSize: '1.05rem',
    lineHeight: '1.8',
    overflowY: 'auto',
    textAlign: 'justify',
};

interface ChapterContentProps {
    id: string; // Added id prop
    text: string[];
    highlightIndex: number;
    playerStatus: number;
    updateTrigger?: number;
}

interface ReplacementRule {
    key: string;
    value: string;
}

interface StoredData {
    mapList: ReplacementRule[];
    regexMode: boolean;
}

const ChapterContent: React.FC<ChapterContentProps> = ({
                                                           id,
                                                           text,
                                                           highlightIndex,
                                                           playerStatus,
                                                           updateTrigger,
                                                       }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const currentSentenceRef = useRef<HTMLParagraphElement | null>(null);
    const [processedText, setProcessedText] = useState<string[]>(text);

    // Apply replacements to text
    const applyReplacements = (sentences: string[], rules: ReplacementRule[], regexMode: boolean): string[] => {
        return sentences.map(sentence => {
            let result = sentence;
            rules.forEach(rule => {
                if (rule.key.trim()) {
                    try {
                        if (regexMode) {
                            const regex = new RegExp(rule.key, 'g');
                            result = result.replace(regex, rule.value);
                        } else {
                            result = result.split(rule.key).join(rule.value);
                        }
                    } catch (e) {
                        console.error(`Error applying replacement for "${rule.key}":`, e);
                    }
                }
            });
            return result;
        });
    };

    // Load replacements from localStorage and apply them
    useEffect(() => {
        const localStorageKey = `wordReplacementMap_${id}`;
        const storedData = localStorage.getItem(localStorageKey);

        if (storedData) {
            try {
                const { mapList, regexMode }: StoredData = JSON.parse(storedData);
                if (mapList && mapList.length > 0) {
                    const replacedText = applyReplacements(text, mapList, regexMode);
                    setProcessedText(replacedText);
                    return;
                }
            } catch (e) {
                console.error('Failed to parse replacement rules:', e);
            }
        }

        // Fallback to original text if no replacements
        setProcessedText(text);
    }, [id, text,updateTrigger]);

    // Scroll to highlighted sentence
    useEffect(() => {
        if (currentSentenceRef.current && playerStatus === 1) {
            currentSentenceRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    }, [highlightIndex, playerStatus]);

    return (
        <article style={chapterContentStyle} ref={containerRef}>
            {processedText.length === 0 ? (
                <em style={{ color: '#5b4636' }}>No content available.</em>
            ) : (
                processedText.map((sentence, i) => {
                    const isHighlighted = i === highlightIndex && playerStatus === 1;
                    return (
                        <React.Fragment key={i}>
                            <p
                                ref={isHighlighted ? currentSentenceRef : null}
                                style={{
                                    margin: 0,
                                    backgroundColor: isHighlighted ? '#fffbcc' : undefined,
                                    borderRadius: isHighlighted ? '4px' : undefined,
                                    padding: isHighlighted ? '5px' : undefined,
                                    fontWeight: isHighlighted ? '500' : undefined,
                                    color: '#5b4636',
                                }}
                            >
                                {sentence}
                            </p>
                            <br />
                        </React.Fragment>
                    );
                })
            )}
        </article>
    );
};

export default ChapterContent;