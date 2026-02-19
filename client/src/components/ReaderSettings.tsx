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
    onDeleteContent,
    onReplacementsSaved,
    fontSize,
    onFontSizeChange,
    fontFamily,
    onFontFamilyChange
}) => {
    // --- Word Replacement State ---
    const [mapList, setMapList] = useState<MapItem[]>([{ key: '', value: '' }]);
    const [regexMode, setRegexMode] = useState(false);
    const localStorageKey = `wordReplacementMap_${id}`;

    // Load replacements on mount/id change
    useEffect(() => {
        if (show) { // Reload when opened to ensure fresh state if changed elsewhere
            const loadFromLocalStorage = () => {
                try {
                    const storedData = localStorage.getItem(localStorageKey);
                    if (storedData) {
                        const parsedData: StoredData = JSON.parse(storedData);
                        if (parsedData.mapList && parsedData.mapList.length > 0) {
                            setMapList(parsedData.mapList);
                        } else {
                            setMapList([{ key: '', value: '' }]);
                        }
                        if (parsedData.regexMode !== undefined) {
                            setRegexMode(parsedData.regexMode);
                        }
                    } else {
                        setMapList([{ key: '', value: '' }]);
                        setRegexMode(false);
                    }
                } catch (error) {
                    console.error('Failed to load from local storage:', error);
                }
            };
            loadFromLocalStorage();
        }
    }, [id, localStorageKey, show]);

    // Word Replacement Handlers
    const handleMapChange = (index: number, field: 'key' | 'value', value: string) => {
        const updatedList = [...mapList];
        updatedList[index][field] = value;
        setMapList(updatedList);
    };

    const handleAddMapItem = () => {
        setMapList([...mapList, { key: '', value: '' }]);
    };

    const handleRemoveMapItem = (index: number) => {
        if (mapList.length <= 1) return;
        const updatedList = [...mapList];
        updatedList.splice(index, 1);
        setMapList(updatedList);
    };

    const saveReplacements = () => {
        const filteredList = mapList.filter(item => item.key.trim() !== '');
        const dataToStore: StoredData = {
            mapList: filteredList.length > 0 ? filteredList : [{ key: '', value: '' }],
            regexMode
        };
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(dataToStore));
            console.log(`Saved settings for ID ${id}:`, dataToStore);
        } catch (error) {
            console.error('Failed to save to local storage:', error);
        }
    };

    const handleClose = () => {
        // Explicit save required for replacements
        onHide();
    };

    const handleSaveReplacements = () => {
        saveReplacements();
        if (onReplacementsSaved) onReplacementsSaved();
        // Feedback?
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
                                {voice.name} ({voice.lang})
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
                <div className="p-3" style={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
                    {mapList.map((item, index) => (
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
                                    disabled={mapList.length <= 1}
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
                            checked={regexMode}
                            onChange={(e) => setRegexMode(e.target.checked)}
                            style={{ userSelect: 'none' }}
                        />
                    </div>
                    <div className="mt-3 text-end">
                        <Button variant="primary" size="sm" onClick={handleSaveReplacements}>
                            Save Replacements
                        </Button>
                    </div>
                </div>

                {/* Cache Management */}
                <h5 style={{ borderBottom: '1px solid #d6c8a8', paddingBottom: '5px', marginBottom: '15px', marginTop: '30px' }}>Storage</h5>
                <Button variant="danger" onClick={onDeleteContent}>
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
