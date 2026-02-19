import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

interface ReaderSettingsProps {
    show: boolean;
    onHide: () => void;
    id: string; // bookId
    // Voice Props
    voices: SpeechSynthesisVoice[];
    selectedVoice: string;
    onChangeVoice: (voiceURI: string) => void;
    // Speed Props
    speed: number;
    onSpeedChange: (speed: number) => void;
    // Cache Props
    onDeleteContent: () => void;
    onReplacementsSaved?: () => void;
    // Font Props
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    fontFamily: string;
    onFontFamilyChange: (font: string) => void;
    // Offline Props - Removed as per request (controlled by Dashboard)
}

interface MapItem {
    key: string;
    value: string;
}

interface StoredData {
    mapList: MapItem[];
    regexMode: boolean;
}

const ReaderSettings: React.FC<ReaderSettingsProps> = ({
    show,
    onHide,
    id,
    voices,
    selectedVoice,
    onChangeVoice,
    speed,
    onSpeedChange,
    fontSize,
    onFontSizeChange,
    fontFamily,
    onFontFamilyChange,
    onDeleteContent,
    onReplacementsSaved
}) => {
    // --- Word Replacement State ---
    const [mapList, setMapList] = useState<MapItem[]>([{ key: '', value: '' }]);
    const [regexMode, setRegexMode] = useState(false);

    const [globalMapList, setGlobalMapList] = useState<MapItem[]>([{ key: '', value: '' }]);
    const [globalRegexMode, setGlobalRegexMode] = useState(false);

    const [replacementTab, setReplacementTab] = useState<'local' | 'global'>('local');

    const localStorageKey = `wordReplacementMap_${id}`;
    const globalStorageKey = `wordReplacementMap_global`;

    // Load replacements on mount/id change
    useEffect(() => {
        if (show) {
            // Load Local
            try {
                const storedData = localStorage.getItem(localStorageKey);
                if (storedData) {
                    const parsedData: StoredData = JSON.parse(storedData);
                    setMapList((parsedData.mapList && parsedData.mapList.length > 0) ? parsedData.mapList : [{ key: '', value: '' }]);
                    setRegexMode(parsedData.regexMode ?? false);
                } else {
                    setMapList([{ key: '', value: '' }]);
                    setRegexMode(false);
                }
            } catch (error) {
                console.error('Failed to load local replacements:', error);
            }

            // Load Global
            try {
                const storedGlobal = localStorage.getItem(globalStorageKey);
                if (storedGlobal) {
                    const parsedData: StoredData = JSON.parse(storedGlobal);
                    setGlobalMapList((parsedData.mapList && parsedData.mapList.length > 0) ? parsedData.mapList : [{ key: '', value: '' }]);
                    setGlobalRegexMode(parsedData.regexMode ?? false);
                } else {
                    setGlobalMapList([{ key: '', value: '' }]);
                    setGlobalRegexMode(false);
                }
            } catch (error) {
                console.error('Failed to load global replacements:', error);
            }
        }
    }, [id, localStorageKey, globalStorageKey, show]);

    // Word Replacement Handlers
    const handleMapChange = (index: number, field: 'key' | 'value', value: string) => {
        if (replacementTab === 'local') {
            const updatedList = [...mapList];
            updatedList[index][field] = value;
            setMapList(updatedList);
        } else {
            const updatedList = [...globalMapList];
            updatedList[index][field] = value;
            setGlobalMapList(updatedList);
        }
    };

    const handleAddMapItem = () => {
        if (replacementTab === 'local') {
            setMapList([...mapList, { key: '', value: '' }]);
        } else {
            setGlobalMapList([...globalMapList, { key: '', value: '' }]);
        }
    };

    const handleRemoveMapItem = (index: number) => {
        if (replacementTab === 'local') {
            if (mapList.length <= 1) return;
            const updatedList = [...mapList];
            updatedList.splice(index, 1);
            setMapList(updatedList);
        } else {
            if (globalMapList.length <= 1) return;
            const updatedList = [...globalMapList];
            updatedList.splice(index, 1);
            setGlobalMapList(updatedList);
        }
    };

    const setRegexModeInternal = (checked: boolean) => {
        if (replacementTab === 'local') {
            setRegexMode(checked);
        } else {
            setGlobalRegexMode(checked);
        }
    }

    const saveReplacements = () => {
        // Save current tab's list? Or both? Ideally save what we edited.
        // Let's just save based on current tab to be safe, or separate save buttons?
        // UI has one button "Save {Tab} Replacements".

        if (replacementTab === 'local') {
            const filteredList = mapList.filter(item => item.key.trim() !== '');
            const dataToStore: StoredData = {
                mapList: filteredList.length > 0 ? filteredList : [{ key: '', value: '' }],
                regexMode
            };
            localStorage.setItem(localStorageKey, JSON.stringify(dataToStore));
            console.log(`Saved local settings for ID ${id}`);
        } else {
            const filteredList = globalMapList.filter(item => item.key.trim() !== '');
            const dataToStore: StoredData = {
                mapList: filteredList.length > 0 ? filteredList : [{ key: '', value: '' }],
                regexMode: globalRegexMode
            };
            localStorage.setItem(globalStorageKey, JSON.stringify(dataToStore));
            console.log(`Saved global settings`);
        }
    };

    const handleClose = () => {
        onHide();
    };

    const handleSaveReplacements = () => {
        saveReplacements();
        if (onReplacementsSaved) onReplacementsSaved();
        alert(`${replacementTab === 'local' ? 'Book' : 'Global'} replacements saved!`);
    };

    const sortedVoices = [...voices].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title style={{ fontFamily: "'Georgia', serif", color: "#4a3b1f" }}>Reader Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#f5f1e9', color: '#3a2d0b' }}>

                {/* Voice Selection */}
                <h5 style={{ borderBottom: '1px solid #d6c8a8', paddingBottom: '5px', marginBottom: '15px' }}>Voice & Speed</h5>
                <Form.Group className="mb-3">
                    <Form.Label>Select Voice</Form.Label>
                    <Form.Select
                        value={selectedVoice}
                        onChange={(e) => onChangeVoice(e.target.value)}
                        disabled={voices.length === 0}
                    >
                        {voices.length === 0 && <option disabled>No voices available</option>}
                        {sortedVoices.map((voice) => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                                {voice.name} ({voice.lang}){(voice as any).localService ? " (On Device)" : ""}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label>Playback Speed: {speed.toFixed(1)}x</Form.Label>
                    <Form.Range
                        min={0.5}
                        max={3.0}
                        step={0.1}
                        value={speed}
                        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                    />
                </Form.Group>

                {/* Font Settings */}
                <h5 style={{ borderBottom: '1px solid #d6c8a8', paddingBottom: '5px', marginBottom: '15px', marginTop: '30px' }}>Appearance</h5>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label>Font Size: {fontSize}px</Form.Label>
                        <Form.Range
                            min={12}
                            max={32}
                            step={1}
                            value={fontSize}
                            onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
                        />
                    </Col>
                    <Col md={6}>
                        <Form.Label>Font Family</Form.Label>
                        <Form.Select
                            value={fontFamily}
                            onChange={(e) => onFontFamilyChange(e.target.value)}
                        >
                            <option value="'Georgia', serif">Georgia (Serif)</option>
                            <option value="'Times New Roman', Times, serif">Times New Roman</option>
                            <option value="'Arial', sans-serif">Arial (Sans)</option>
                            <option value="'Verdana', sans-serif">Verdana</option>
                            <option value="'Segoe UI', sans-serif">Segoe UI</option>
                            <option value="'Courier New', monospace">Courier New (Mono)</option>
                        </Form.Select>
                    </Col>
                </Row>

                {/* Word Replacements */}
                <h5 style={{ borderBottom: '1px solid #d6c8a8', paddingBottom: '5px', marginBottom: '15px', marginTop: '30px' }}>Word Replacements</h5>

                {/* Tabs for Global vs Local */}
                <div className="d-flex mb-2">
                    <Button
                        variant={replacementTab === 'local' ? 'primary' : 'outline-primary'}
                        size="sm"
                        className="me-2"
                        onClick={() => setReplacementTab('local')}
                    >
                        This Book
                    </Button>
                    <Button
                        variant={replacementTab === 'global' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setReplacementTab('global')}
                    >
                        Global (All Books)
                    </Button>
                </div>

                <div className="p-3" style={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <p className="text-muted small mb-3">
                        {replacementTab === 'local'
                            ? "Rules apply only to this book."
                            : "Rules apply to all books. Global rules run before local rules."}
                    </p>

                    {(replacementTab === 'local' ? mapList : globalMapList).map((item, index) => (
                        <Row key={index} className="mb-2 align-items-center">
                            <Col>
                                <Form.Control
                                    placeholder="Word to replace"
                                    value={item.key}
                                    onChange={(e) => handleMapChange(index, 'key', e.target.value)}
                                    size="sm"
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    placeholder="Replacement text"
                                    value={item.value}
                                    onChange={(e) => handleMapChange(index, 'value', e.target.value)}
                                    size="sm"
                                />
                            </Col>
                            <Col xs="auto">
                                <Button
                                    variant="outline-danger"
                                    onClick={() => handleRemoveMapItem(index)}
                                    disabled={(replacementTab === 'local' ? mapList : globalMapList).length <= 1}
                                    size="sm"
                                >
                                    ×
                                </Button>
                            </Col>
                        </Row>
                    ))}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <Button variant="outline-success" size="sm" onClick={handleAddMapItem}>
                            + Add Replacement
                        </Button>
                        <Form.Check
                            type="checkbox"
                            label="Use Regex"
                            checked={replacementTab === 'local' ? regexMode : globalRegexMode}
                            onChange={(e) => setRegexModeInternal(e.target.checked)}
                            style={{ userSelect: 'none' }}
                        />
                    </div>
                    <div className="mt-3 text-end">
                        <Button variant="primary" size="sm" onClick={handleSaveReplacements}>
                            Save {replacementTab === 'local' ? 'Book' : 'Global'} Replacements
                        </Button>
                    </div>
                </div>

                {/* Cache Management */}
                <h5 style={{ borderBottom: '1px solid #d6c8a8', paddingBottom: '5px', marginBottom: '15px', marginTop: '30px' }}>Storage</h5>
                <p className="text-muted small">
                    Offline mode is managed from the Dashboard.
                </p>

                <Button variant="danger" onClick={onDeleteContent} className="w-100">
                    Delete Chapter Cache
                </Button>

            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#e9e2d0' }}>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ReaderSettings;
