import React, { useEffect, useRef } from 'react';

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
    text: string[];
    highlightIndex: number;
    playerStatus: 0 | 1 | 2; // More semantic type
}

const ChapterContent: React.FC<ChapterContentProps> = ({ text, highlightIndex, playerStatus }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const currentSentenceRef = useRef<HTMLParagraphElement | null>(null);

    useEffect(() => {
        if (currentSentenceRef.current) {
            currentSentenceRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [highlightIndex]);

    return (
        <article style={chapterContentStyle} ref={containerRef}>
            {text.length === 0 ? (
                <em>No content available.</em>
            ) : (
                text.map((sentence, i) => {
                    const isHighlighted = i === highlightIndex && playerStatus === 1;
                    return (
                        <p
                            key={`sentence-${i}-${sentence.substring(0, 10)}`} // Better key
                            ref={isHighlighted ? currentSentenceRef : null}
                            style={{
                                margin: '0 0 1em 0', // Better spacing than <br/>
                                backgroundColor: isHighlighted ? '#fffbcc' : undefined,
                                borderRadius: isHighlighted ? '4px' : undefined,
                                padding: isHighlighted ? '5px' : undefined,
                                color: '#5b4636',
                            }}
                        >
                            {sentence}
                        </p>
                    );
                })
            )}
        </article>
    );
};

export default ChapterContent;