import React, {useCallback, useEffect, useRef, useState} from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { Container } from "react-bootstrap";
import ChapterList from "./ChapterList";
import PlayersControl from "./PlayersControl";
import VoiceSelector from "./VoiceSelector";
import ChapterContent from "./ChapterContent";
import { TextToSpeech } from "../utils/TextToSpeech";
import { processTextWithReplacements } from "../utils/WordReplacement";

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
    const [content, setContent] = useState<string[]>([]);

    // Fetch chapters content and restore state
    useEffect(() => {
        const fetchChapters = async () => {
            setLoading(true);
            try {
                let chapters: Item[] = [];
                const storedContent = await getChaptersContent(id || "");
                if (storedContent && Array.isArray(storedContent)) {
                    chapters = storedContent;
                    setItems(chapters);

                    // Clamp indices loaded from storage
                    let sel = selectedItem;
                    if (sel < 0 || sel >= chapters.length) sel = 0;
                    setSelectedItem(sel);

                    let sent = sentenceIndex;
                    const maxSent = chapters[sel]?.content.length || 0;
                    if (sent < 0 || sent >= maxSent) sent = 0;
                    setSentenceIndex(sent);

                } else {
                    // Fetch fresh from API, use API’s progress to override stored state
                    const res = await axios.get(`${baseUrl}/epub/${id}`);
                    chapters = (res.data.content || []).sort((a: Item, b: Item) => a.id - b.id);
                    setItems(chapters);

                    const sel = Math.max(0, Math.min(res.data.chapterid || 0, chapters.length - 1));
                    setSelectedItem(sel);

                    const sentenceMax = chapters[sel]?.content.length || 0;
                    const sent = Math.max(0, Math.min(res.data.sentenceid || 0, sentenceMax - 1));
                    setSentenceIndex(sent);

                    // Cache data and update storage
                    await saveChaptersContent(id || "", chapters);
                    saveSelectedChapter(id || "", sel);
                    saveSentenceIndex(id || "", sent);
                }
            } catch (err) {
                console.error("Failed to fetch chapters:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchChapters();
        // eslint-disable-next-line
    }, [id]);

    // Validate selectedItem if chapters change
    useEffect(() => {
        if (items.length && (selectedItem < 0 || selectedItem >= items.length)) {
            setSelectedItem(0);
        }
        // eslint-disable-next-line
    }, [items]);

    // Validate sentenceIndex when chapter changes
    useEffect(() => {
        const max = items[selectedItem]?.content.length || 0;
        if (sentenceIndex < 0 || sentenceIndex >= max) {
            setSentenceIndex(0);
        }
        // eslint-disable-next-line
    }, [selectedItem, items]);

    // Sync selectedItem to localStorage on change
    useEffect(() => {
        if (id) saveSelectedChapter(id, selectedItem);
    }, [selectedItem, id]);

    // Sync sentenceIndex to localStorage on change
    useEffect(() => {
        if (id) saveSentenceIndex(id, sentenceIndex);
    }, [sentenceIndex, id]);

    // Load available voices and saved voice selection
    useEffect(() => {
        const loadVoices = () => {
            const synthVoices = window.speechSynthesis.getVoices();
            if (synthVoices.length > 0) {
                setVoices(synthVoices);

                let savedVoice = getSelectedVoice();
                if (!savedVoice && synthVoices[0]) savedVoice = synthVoices[0].voiceURI;

                const found = synthVoices.find(v => v.voiceURI === savedVoice);
                const voiceToUse = found?.voiceURI || synthVoices[0].voiceURI;
                setSelectedVoice(voiceToUse);
                ttsRef.current.setVoice(voiceToUse);
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    useEffect(() => {
        if (selectedVoice) {
            ttsRef.current.setVoice(selectedVoice);
            saveSelectedVoice(selectedVoice);
        }
    }, [selectedVoice]);

    // On chapter change, reset sentence and stop player
    useEffect(() => {
        setSentenceIndex(0);
    }, [selectedItem]);

    // Process text content with replacements
    useEffect(() => {
        if (items[selectedItem]?.content) {
            setContent(processTextWithReplacements(id || "", items[selectedItem].content));
        } else {
            setContent([]);
        }
        // eslint-disable-next-line
    }, [items, selectedItem, updateTrigger, id]);

    // Speak current sentence when playerStatus is playing and sentenceIndex changes
    useEffect(() => {
        if (playerStatus === 1 && content.length > 0 && sentenceIndex < content.length) {
            speak();
        }
        // eslint-disable-next-line
    }, [sentenceIndex, playerStatus, selectedItem, content]);

    // Setup speech rate and onEnd handler; clean up on unmount
    useEffect(() => {
        ttsRef.current.setRate(speed);
        ttsRef.current.onEnd = () => {
            if (playerStatus === 1 && sentenceIndex < content.length - 1) {
                setSentenceIndex(prev => prev + 1);
            } else if (playerStatus === 1 && sentenceIndex === content.length - 1) {
                onNext();
            }
        };
        return () => {
            ttsRef.current.onEnd = null;
        };
        // eslint-disable-next-line
    }, [speed, playerStatus, sentenceIndex, selectedItem, content]);


    // ------- Handlers -------
    const toggleCollapse = () => setCollapsed(prev => !prev);

    const onVoiceChange = (val: string) => {
        setSelectedVoice(val);
        ttsRef.current.setVoice(val);
        saveSelectedVoice(val);
    };

    const speak = () => {
        const currentSentence = content?.[sentenceIndex];
        if (!currentSentence) return;

        if (ttsRef.current.isPaused()) {
            ttsRef.current.resume();
            return;
        }

        ttsRef.current.speak(currentSentence);
    };

    const onPlayPause = () => {
        if (playerStatus === 1) {
            setPlayerStatus(2);
            ttsRef.current.pause();
        } else if (playerStatus === 2) {
            setPlayerStatus(1);
            ttsRef.current.resume();
        } else {
            setPlayerStatus(1);
            speak();
        }
        if (id) saveProgress(id, selectedItem, sentenceIndex);
    };

    const onStop = () => {
        ttsRef.current.stop();
        setPlayerStatus(0);
        if (id) saveProgress(id, selectedItem, sentenceIndex);
    };

    const onNext = () => {
        if (selectedItem < items.length - 1) {
            setSelectedItem(prev => prev + 1);
        } else {
            setPlayerStatus(0);
        }
    };

    const onPrevious = () => {
        if (selectedItem > 0) {
            setSelectedItem(prev => prev - 1);
        }
    };

    const onChapterSelect = (selectId: number) => {
        setSelectedItem(selectId);
        setSentenceIndex(0);
        setPlayerStatus(0);
    };

    const onForward = () => {
        if (content && sentenceIndex < content.length - 1) {
            setSentenceIndex(prev => prev + 1);
        }
    };

    const onBackForward = () => {
        if (sentenceIndex > 0) {
            setSentenceIndex(prev => prev - 1);
        }
    };

    const onSpeedChange = (val: number) => {
        ttsRef.current.setRate(val);
        setSpeed(val);
    };

    const handlePopupSubmit = () => {
        setUpdateTrigger(prev => prev + 1);
    };

    const handleDeleteContent = async () => {
        if (!id) return;
        await deleteChaptersContent(id);
        setItems([]);
        setContent([]);
        setSelectedItem(0);
        setSentenceIndex(0);
        setPlayerStatus(0);
    };

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Don't trigger shortcuts if user is focused on an input, textarea, or editable element
            const tagName = (event.target as HTMLElement).tagName.toLowerCase();
            const isEditable = (event.target as HTMLElement).isContentEditable;
            if (tagName === "input" || tagName === "textarea" || isEditable) {
                return;
            }

            switch (event.code) {
                case "Space":
                    event.preventDefault();
                    onPlayPause();
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    onBackForward(); // rewind 1 sentence backward
                    break;
                case "ArrowDown":
                    event.preventDefault();
                    onForward(); // forward 1 sentence
                    break;
                case "ArrowLeft":
                    event.preventDefault();
                    onPrevious(); // previous chapter
                    break;
                case "ArrowRight":
                    event.preventDefault();
                    onNext(); // next chapter
                    break;
            }
        },
        [onPlayPause, onBackForward, onForward, onPrevious, onNext]
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
                sentenceIndex={sentenceIndex}
                sentenceCount={content.length}
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
