import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { Container, Alert } from "react-bootstrap";
import ChapterList from "./ChapterList";
import PlayersControl from "./PlayersControl";
import VoiceSelector from "./VoiceSelector";
import ChapterContent from "./ChapterContent";
import { TextToSpeech } from "../utils/TextToSpeech";
import { processTextWithReplacements } from "../utils/WordReplacement";
import { useNavigate } from "react-router-dom";

import {
    saveChaptersContent,
    getChaptersContent,
    saveSelectedChapter,
    getSelectedChapter,
    saveSentenceIndex,
    getSentenceIndex,
    saveSelectedVoice,
    getSelectedVoice,
    deleteChaptersContent
} from "../utils/db";

const baseUrl = process.env.REACT_APP_API_BASE_URL;
const color1 = "#f5f1e9";

interface Item {
    id: number;
    name: string;
    path: string;
    content: string[];
}

async function saveProgress(bookId: string, chapterId: number, sentenceId: number) {
    try {
        await axios.post(`${baseUrl}/epub/${bookId}/progress`, {
            chapterId,
            sentenceId,
        });
    } catch (err) {
        console.error('Failed to save progress:', err);
    }
}

const ReaderMain: React.FC = () => {
    const { id } = useParams();

    // Restore selected chapter index from storage or default 0
    const [selectedItem, setSelectedItem] = useState(() => {
        if (!id) return 0;
        const stored = getSelectedChapter(id);
        return stored !== null ? stored : 0;
    });

    // Restore sentence index from storage or default 0
    const [sentenceIndex, setSentenceIndex] = useState(() => {
        if (!id) return 0;
        const stored = getSentenceIndex(id);
        return stored !== null ? stored : 0;
    });

    const [items, setItems] = useState<Item[]>([]);
    const [collapsed, setCollapsed] = useState(false);
    const [playerStatus, setPlayerStatus] = useState<0 | 1 | 2>(0);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>("");
    const [speed, setSpeed] = useState(1);
    const [loading, setLoading] = useState(true);
    const ttsRef = useRef(new TextToSpeech());
    const [updateTrigger, setUpdateTrigger] = useState<number>(0);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState<string[]>([]);
    const navigate = useNavigate();

    // Fetch chapters content and restore state
    useEffect(() => {
        const fetchChapters = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            setIsOfflineMode(false);
            try {
                // Network First: Try to fetch from API
                const res = await axios.get(`${baseUrl}/epub/${id}`);
                const chapters = (res.data.content || []).sort((a: Item, b: Item) => a.id - b.id);
                setItems(chapters);

                // Sync progress from server
                const sel = Math.max(0, Math.min(res.data.chapterid || 0, chapters.length - 1));
                setSelectedItem(sel);

                const sentenceMax = chapters[sel]?.content.length || 0;
                const sent = Math.max(0, Math.min(res.data.sentenceid || 0, sentenceMax - 1));
                setSentenceIndex(sent);

                // Update cache
                await saveChaptersContent(id, chapters);
                saveSelectedChapter(id, sel);
                saveSentenceIndex(id, sent);

            } catch (err) {
                console.error("Failed to fetch from API, attempting cache fallback:", err);
                try {
                    const storedContent = await getChaptersContent(id);
                    if (storedContent && Array.isArray(storedContent) && storedContent.length > 0) {
                        console.log("Loaded chapters from cache");
                        setItems(storedContent);
                        setIsOfflineMode(true);

                        // Validate current selection
                        setSelectedItem(prev => {
                            if (prev < 0 || prev >= storedContent.length) return 0;
                            return prev;
                        });
                    } else {
                        throw new Error("No content available offline");
                    }
                } catch (cacheErr) {
                    console.error("Failed to load from cache:", cacheErr);
                    setError("Failed to load book content. Please check your connection.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchChapters();
        // eslint-disable-next-line
    }, [id]);

    // Process text when chapter or ID changes
    useEffect(() => {
        if (!id || !items[selectedItem]) return;
        const rawContent = items[selectedItem].content;
        const processed = processTextWithReplacements(id, rawContent);
        setContent(processed);
    }, [id, selectedItem, items, updateTrigger]);

    // Voices handling
    const loadVoices = useCallback(() => {
        const synthVoices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
        if (synthVoices.length > 0) {
            setVoices(synthVoices);

            let savedVoice = id ? getSelectedVoice(id) : null;
            // Ensure saved voice is still valid (exists in our filtered list)
            const found = synthVoices.find(v => v.voiceURI === savedVoice);

            if (!found && synthVoices[0]) {
                savedVoice = synthVoices[0].voiceURI;
            } else if (found) {
                savedVoice = found.voiceURI;
            }

            if (savedVoice) {
                setSelectedVoice(savedVoice);
                ttsRef.current.setVoice(savedVoice);
            }
        }
    }, [id]);

    useEffect(() => {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [loadVoices]);


    const play = useCallback((index: number) => {
        if (!content || !content[index]) return;

        ttsRef.current.stop();
        setPlayerStatus(1);

        ttsRef.current.onEnd = () => {
            if (index < content.length - 1) {
                setSentenceIndex(index + 1);
            } else {
                // End of chapter
                if (selectedItem < items.length - 1) {
                    setSelectedItem(s => s + 1);
                    setSentenceIndex(0);
                } else {
                    setPlayerStatus(0);
                }
            }
        };

        ttsRef.current.speak(content[index]);
    }, [content, selectedItem, items.length]);

    // Effect to auto-play when sentenceIndex changes IF valid and playing
    useEffect(() => {
        if (playerStatus === 1) {
            play(sentenceIndex);
        }
        // Save progress
        if (id) {
            saveSentenceIndex(id, sentenceIndex);
            saveProgress(id, selectedItem, sentenceIndex);
        }
    }, [sentenceIndex, playerStatus, play, id, selectedItem]);

    // Stop function
    const onStop = () => {
        ttsRef.current.stop();
        setPlayerStatus(0);
    };

    const onPlayPause = () => {
        if (playerStatus === 1) {
            ttsRef.current.pause();
            setPlayerStatus(2); // Paused
        } else if (playerStatus === 2) {
            ttsRef.current.resume();
            setPlayerStatus(1);
        } else {
            play(sentenceIndex);
        }
    };

    // Navigation
    const onNext = () => {
        if (selectedItem < items.length - 1) {
            setSelectedItem(s => s + 1);
            setSentenceIndex(0);
        }
    };

    const onPrevious = () => {
        if (selectedItem > 0) {
            setSelectedItem(s => s - 1);
            setSentenceIndex(0);
        }
    };

    const onForward = () => {
        if (content && sentenceIndex < content.length - 1) {
            setSentenceIndex(s => s + 1);
        }
    };

    const onBackForward = () => {
        if (sentenceIndex > 0) {
            setSentenceIndex(s => s - 1);
        }
    };

    // Settings
    const onSpeedChange = (newSpeed: number) => {
        setSpeed(newSpeed);
        ttsRef.current.setRate(newSpeed);
    };

    const onVoiceChange = (voiceURI: string) => {
        setSelectedVoice(voiceURI);
        ttsRef.current.setVoice(voiceURI);
        if (id) saveSelectedVoice(id, voiceURI);
        // If speaking, restart with new voice
        if (playerStatus === 1) {
            play(sentenceIndex);
        }
    };

    const toggleCollapse = () => setCollapsed(!collapsed);

    const onChapterSelect = (chapterId: number) => {
        setSelectedItem(chapterId);
        setSentenceIndex(0);
        if (id) saveSelectedChapter(id, chapterId);
    };

    const handlePopupSubmit = () => {
        setUpdateTrigger(t => t + 1);
    };

    const handleDeleteContent = async () => {
        if (!id) return;
        await deleteChaptersContent(id);
        navigate(`/`);
    };

    // ------- Refs for Event Handlers -------
    // We use refs to hold the latest version of handlers so the window 'keydown' listener
    // doesn't need to be removed/added on every render/state change.
    const handlersRef = useRef({
        onPlayPause: () => { },
        onBackForward: () => { },
        onForward: () => { },
        onPrevious: () => { },
        onNext: () => { },
    });

    // Update refs whenever handlers change
    useEffect(() => {
        handlersRef.current = {
            onPlayPause,
            onBackForward,
            onForward,
            onPrevious,
            onNext,
        };
    });

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Don't trigger shortcuts if user is focused on an input, textarea, or editable element
            const target = event.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();
            const isEditable = target.isContentEditable;
            if (tagName === "input" || tagName === "textarea" || isEditable) {
                return;
            }

            switch (event.code) {
                case "Space":
                    event.preventDefault();
                    handlersRef.current.onPlayPause();
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    handlersRef.current.onBackForward();
                    break;
                case "ArrowDown":
                    event.preventDefault();
                    handlersRef.current.onForward();
                    break;
                case "ArrowLeft":
                    event.preventDefault();
                    handlersRef.current.onPrevious();
                    break;
                case "ArrowRight":
                    event.preventDefault();
                    handlersRef.current.onNext();
                    break;
            }
        },
        [] // No dependencies, stable callback
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    // ------- Render -------
    if (loading) {
        return (
            <Container
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "100vh", minWidth: "100vw", backgroundColor: color1 }}
            >
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
                    <div>Loading EPUB chapters...</div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "100vh", minWidth: "100vw", backgroundColor: color1 }}
            >
                <div className="text-center text-danger">
                    <h3>Error</h3>
                    <p>{error}</p>
                    <div className="d-flex gap-3 justify-content-center">
                        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
                        <button className="btn btn-secondary" onClick={() => navigate('/')}>Back to Dashboard</button>
                    </div>
                </div>
            </Container>
        );
    }

    const selectedChapter = items[selectedItem] || items[0] || { name: "" };

    return (
        <Container
            fluid
            className="d-flex flex-column p-0 m-0"
            style={{
                flexGrow: 1,
                height: "100%",
                width: "100vw",
                backgroundColor: color1,
            }}
        >
            {isOfflineMode && (
                <Alert variant="warning" dismissible onClose={() => setIsOfflineMode(false)} className="m-0 rounded-0 text-center">
                    Offline Mode: Showing cached content.
                </Alert>
            )}
            <ChapterList
                items={items}
                onSelect={onChapterSelect}
                collapsed={collapsed}
                toggleCollapse={toggleCollapse}
                selectedId={selectedItem}
            />
            <PlayersControl
                selectedId={selectedItem}
                totalChapters={items.length}
                playerStatus={playerStatus}
                speed={speed}
                onPlayPause={onPlayPause}
                onStop={onStop}
                onNext={onNext}
                onPrevious={onPrevious}
                onForward={onForward}
                onBackForward={onBackForward}
                onSpeedChange={onSpeedChange}
                onToggleChapters={toggleCollapse}
            />
            <VoiceSelector
                id={id || ''}
                voices={voices}
                selectedVoice={selectedVoice}
                onChangeVoice={onVoiceChange}
                selectedChapter={selectedChapter.name}
                handlePopupSubmit={handlePopupSubmit}
                onDeleteContent={handleDeleteContent}
            />
            <ChapterContent
                text={content}
                highlightIndex={sentenceIndex}
                playerStatus={playerStatus}
            />
        </Container>
    );
};

export default ReaderMain;
