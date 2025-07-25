import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { Container } from "react-bootstrap";
import ChapterList from "./ChapterList";
import PlayersControl from "./PlayersControl";
import VoiceSelector from "./VoiceSelector";
import ChapterContent from "./ChapterContent";
import { TextToSpeech } from "../utils/TextToSpeech";
import { useNativeWakeLock } from "../hooks/useNativeWakeLock"
import { set, get } from 'idb-keyval';

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const color1 = "#f5f1e9";

interface Item {
    id: number;
    name: string;
    path: string;
    content: string[];
    contentHtml: string;
}

async function saveProgress(bookId: string, chapterId: number, sentenceId: number) {
    try {
        const res =  await axios.post(`${baseUrl}/epub/${bookId}/progress`, {
            chapterId,
            sentenceId,
        });

        console.log('Progress saved:', res.data);
        return res.data;
    } catch (err) {
        console.error('Failed to save progress:', err);
    }
}

const ReaderMain: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState(0);
    const [collapsed, setCollapsed] = useState(false);
    const [playerStatus, setPlayerStatus] = useState<0 | 1 | 2>(0);
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>("");
    const [speed, setSpeed] = useState(1);
    const [loading, setLoading] = useState(true);
    const ttsRef = useRef(new TextToSpeech());
    const { id } = useParams();
    const [playing, setPlaying] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState<number>(0); // Change this value to force update


    useNativeWakeLock(playing);
    useEffect(() => {
        if (id && selectedItem !== 0) {
            localStorage.setItem(`reader-${id}-selectedItem`, selectedItem.toString());
            localStorage.setItem(`reader-${id}-sentenceIndex`, '0');

        }
    }, [selectedItem, id]);

    useEffect(() => {
        if (id && sentenceIndex !== 0) {
            localStorage.setItem(`reader-${id}-sentenceIndex`, sentenceIndex.toString());
        }
    }, [sentenceIndex, id]);

    // Fetch EPUB Chapters
    useEffect(() => {
        const fetchChapters = async () => {
            try {
                setLoading(true);
                let chapters: Item[] = [];
                const storedContent = await get(`reader-${id}-content`);
                if (storedContent) {
                    chapters = storedContent;
                    setSelectedItem( parseInt(localStorage.getItem(`reader-${id}-selectedItem`) || '', 10));
                    setSentenceIndex(parseInt(localStorage.getItem(`reader-${id}-sentenceIndex`) || '', 10));
                } else {
                    const res = await axios.get(`${baseUrl}/epub/${id}`);
                    chapters = res.data.content.sort((a: any, b: any) => a.id - b.id);
                    localStorage.setItem(`reader-${id}-selectedItem`, res.data.chapterid.toString());
                    localStorage.setItem(`reader-${id}-sentenceIndex`, res.data.sentenceid.toString());
                    setSelectedItem(res.data.chapterid);
                    setSentenceIndex(res.data.sentenceid);
                    await set(`reader-${id}-content`, chapters);
                }
                setItems(chapters);
            } catch (err) {
                console.error("Failed to fetch EPUB:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchChapters();
    }, []);

    // Load voices
    useEffect(() => {
        const loadVoice = () => {
            const synthVoice = window.speechSynthesis.getVoices();
            if (synthVoice.length > 0) {
                setVoices(synthVoice);
                if (!selectedVoice) {
                    setSelectedVoice(synthVoice[0].voiceURI);
                    ttsRef.current.setVoice(synthVoice[0].voiceURI);
                }
            }
        };
        loadVoice();
        window.speechSynthesis.onvoiceschanged = loadVoice;
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [selectedVoice]);

    // Reset sentence index when chapter changes
    useEffect(() => {
        setSentenceIndex(0);
    }, [selectedItem]);

    // Speak when sentence index changes
    useEffect(() => {
        if (playerStatus === 1) {
            speak();
        }
    }, [sentenceIndex,playerStatus,selectedItem]);

    // Initialize TTS speed and handle onEnd
    useEffect(() => {
        ttsRef.current.setRate(speed);
        ttsRef.current.onEnd = () => {
            if (playerStatus === 1 && sentenceIndex < items[selectedItem]?.content?.length - 1) {
                setSentenceIndex((prev) => prev + 1);
                return
            }
            if (playerStatus ===1 && sentenceIndex === items[selectedItem].content?.length - 1) {
                onNext();
            }
        };
    }, [speed, playerStatus, sentenceIndex, selectedItem, items]);

    const toggleCollapse = () => setCollapsed(!collapsed);

    const onVoiceChange = (val: string) => {
        ttsRef.current.setVoice(val);
        setSelectedVoice(val);
    };

    const speak = () => {
        const currentSentence = items[selectedItem]?.content?.[sentenceIndex];
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
            setPlaying(true);
            setPlayerStatus(1);
            ttsRef.current.resume();
        } else {
            setPlaying(true)
            setPlayerStatus(1);
        }
        if(id) {
            saveProgress(id, selectedItem, sentenceIndex);
        }
    };

    const onStop = () => {
        setPlaying(false)
        ttsRef.current.stop();
        if(id) {
            saveProgress(id, selectedItem, sentenceIndex);
        }
        setPlayerStatus(0);
    };

    const onNext = () => {
        if (selectedItem < items.length - 1) {
            setSelectedItem((prev) => prev + 1);
            setSentenceIndex(0);
            if(playerStatus === 1) {
                speak();
            }
        }
    };

    const onPrevious = () => {
        if (selectedItem > 0) {
            setSelectedItem((prev) => prev - 1);
            setSentenceIndex(0);
            if(playerStatus === 1) {
                speak();
            }
        }
    };

    const onChapterSelect = (selectId:number)=>{
        setSelectedItem(selectId);
        setSentenceIndex(0);
    }

    const onForward = () => {
        if (sentenceIndex < items[selectedItem].content.length - 1) {
            setSentenceIndex((prev) => prev + 1);
        }
    };

    const onBackForward = () => {
        if (sentenceIndex > 0) {
            setSentenceIndex((prev) => prev - 1);
        }
    };

    const onSpeedChange = (val: number) => {
        ttsRef.current.setRate(val);
        setSpeed(val);
    };
    const handlePopupSubmit = () => {
        setUpdateTrigger(prev => prev + 1);
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", minWidth: "100vw", backgroundColor: color1 }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }} />
                    <div>Loading EPUB chapters...</div>
                </div>
            </Container>
        );
    }

    return (
        <Container
            fluid // ensures full-width
            className="d-flex flex-column p-0 m-0"
            style={{
                flexGrow: 1,
                height: "100%",
                width: "100vw",
                backgroundColor: color1,
            }}
        >            <ChapterList
                items={items}
                onSelect={onChapterSelect}
                collapsed={collapsed} // renamed logic: collapsed === false means shown
                toggleCollapse={toggleCollapse}
                selectedId={selectedItem}
            />

                <PlayersControl
                    selectedId={selectedItem}
                    totalChapters={items.length}
                    playerStatus={playerStatus}
                    sentenceIndex={sentenceIndex}
                    sentenceCount={items[selectedItem]?.content.length || 0}
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
                <VoiceSelector id={id || ''} voices={voices} selectedVoice={selectedVoice} onChangeVoice={onVoiceChange} selectedChapter={items[selectedItem].name} handlePopupSubmit={handlePopupSubmit} />
                <ChapterContent id={id || ''} text={items[selectedItem]?.content || []} highlightIndex={sentenceIndex} playerStatus={playerStatus} updateTrigger={updateTrigger} />
        </Container>
    );
};

export default ReaderMain;
