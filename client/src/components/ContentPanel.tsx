import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';

type ContentPanelProps = {
    htmlContent: string;
    dropdownItems: string[];
    selectedDropdown: string;
    setSelectedDropdown: (value: string) => void;
    onNext: () => void;
    onPrevious: () => void;
    onPlay: () => void;
};

const ContentPanel: React.FC<ContentPanelProps> = ({
                                                       htmlContent,
                                                       dropdownItems,
                                                       selectedDropdown,
                                                       setSelectedDropdown,
                                                       onNext,
                                                       onPrevious,
                                                       onPlay,
                                                   }) => {
    return (
        <div className="p-3 w-100">
            <div className="mb-3 d-flex gap-2">
                <Button onClick={onPrevious}>Previous</Button>
                <Button onClick={onPlay}>Play</Button>
                <Button onClick={onNext}>Next</Button>
            </div>

            <Dropdown className="mb-3">
                <Dropdown.Toggle variant="secondary">{selectedDropdown || 'Select Option'}</Dropdown.Toggle>
                <Dropdown.Menu>
                    {dropdownItems.map((item, index) => (
                        <Dropdown.Item key={index} onClick={() => setSelectedDropdown(item)}>
                            {item}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>

            <div
                className="border p-3"
                style={{ minHeight:"85vh", background: '#f8f9fa' }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </div>
    );
};

export default ContentPanel;
