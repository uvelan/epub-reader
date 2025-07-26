import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

interface PopupMapFormProps {
    id: string; // Add id prop
    onSubmit?: () => void;

}

interface MapItem {
    key: string;
    value: string;
}

interface StoredData {
    mapList: MapItem[];
    regexMode: boolean;
}

const buttonStyle: React.CSSProperties = {
    backgroundColor: '#b59f63',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    color: '#3a2d0b',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,.15)',
    userSelect: 'none',
    flexShrink: 0
};

const PopupMapForm: React.FC<PopupMapFormProps> = ({ id , onSubmit }) => {
    const [show, setShow] = useState(false);
    const [mapList, setMapList] = useState<MapItem[]>([{ key: '', value: '' }]);
    const [regexMode, setRegexMode] = useState(false);

    // Create unique localStorage key based on id
    const localStorageKey = `wordReplacementMap_${id}`;

    // Load data from local storage when component mounts or id changes
    useEffect(() => {
        const loadFromLocalStorage = () => {
            try {
                const storedData = localStorage.getItem(localStorageKey);
                if (storedData) {
                    const parsedData: StoredData = JSON.parse(storedData);
                    if (parsedData.mapList && parsedData.mapList.length > 0) {
                        setMapList(parsedData.mapList);
                    }
                    if (parsedData.regexMode !== undefined) {
                        setRegexMode(parsedData.regexMode);
                    }
                }
            } catch (error) {
                console.error('Failed to load from local storage:', error);
            }
        };

        loadFromLocalStorage();
    }, [id, localStorageKey]);

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    const handleChange = (index: number, field: 'key' | 'value', value: string) => {
        const updatedList = [...mapList];
        updatedList[index][field] = value;
        setMapList(updatedList);
    };

    const handleAdd = () => {
        setMapList([...mapList, { key: '', value: '' }]);
    };

    const handleRemove = (index: number) => {
        if (mapList.length <= 1) return;
        const updatedList = [...mapList];
        updatedList.splice(index, 1);
        setMapList(updatedList);
    };

    const handleSubmit = () => {
        // Filter out empty keys before saving
        const filteredList = mapList.filter(item => item.key.trim() !== '');
        const dataToStore: StoredData = {
            mapList: filteredList.length > 0 ? filteredList : [{ key: '', value: '' }],
            regexMode
        };

        try {
            localStorage.setItem(localStorageKey, JSON.stringify(dataToStore));
            console.log(`Saved settings for ID ${id}:`, dataToStore);
            if (onSubmit) onSubmit();

        } catch (error) {
            console.error('Failed to save to local storage:', error);
        }

        handleClose();
    };

    return (
        <>
            <Button style={buttonStyle} onClick={handleShow}>
                Word Replacement Settings
            </Button>

            <Modal show={show} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Word Replacement Settings</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {mapList.map((item, index) => (
                        <Row key={index} className="mb-2 align-items-center">
                            <Col>
                                <Form.Control
                                    placeholder="Word to replace"
                                    value={item.key}
                                    onChange={(e) => handleChange(index, 'key', e.target.value)}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    placeholder="Replacement text"
                                    value={item.value}
                                    onChange={(e) => handleChange(index, 'value', e.target.value)}
                                />
                            </Col>
                            <Col xs="auto">
                                <Button
                                    variant="outline-danger"
                                    onClick={() => handleRemove(index)}
                                    disabled={mapList.length <= 1}
                                >
                                    ×
                                </Button>
                            </Col>
                        </Row>
                    ))}

                    <Button variant="outline-success" onClick={handleAdd} className="mb-3">
                        + Add New Replacement
                    </Button>

                    <Form.Group controlId="regexCheckbox">
                        <Form.Check
                            type="checkbox"
                            label="Use regular expressions"
                            checked={regexMode}
                            onChange={(e) => setRegexMode(e.target.checked)}
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default PopupMapForm;