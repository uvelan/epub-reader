import React, { useState, useEffect, useRef } from 'react';
import {
    ListGroup,
    FormControl,
    InputGroup,
    Offcanvas,
} from 'react-bootstrap';

const color2 = "#e4d8c3";

interface Item {
    id: number;
    name: string;
    path: string;
    content: string[];
    contentHtml: string;
}

interface ChapterListProps {
    items: Item[];
    onSelect: (item: number) => void;
    collapsed: boolean; // still using this to toggle offcanvas open/close
    toggleCollapse: () => void;
    selectedId: number;
}

const ChapterList: React.FC<ChapterListProps> = ({
                                                     items,
                                                     onSelect,
                                                     collapsed,
                                                     toggleCollapse,
                                                     selectedId,
                                                 }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const itemRefs = useRef<{ [key: number]: HTMLAnchorElement | null }>({});

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const ref = itemRefs.current[selectedId];
        if (ref) {
            ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedId]);

    return (
        <>


            <Offcanvas
                show={!collapsed}
                onHide={toggleCollapse}
                scroll={true}
                backdrop={false}
                placement="start"
                style={{ backgroundColor: color2 }}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Chapters</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <InputGroup className="mb-3">
                        <FormControl
                            type="text"
                            placeholder="Search chapters..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>

                    <ListGroup>
                        {filteredItems.map((item) => (
                            <ListGroup.Item
                                key={item.id}
                                action
                                active={item.id === selectedId}
                                onClick={() => {
                                    onSelect(item.id);
                                    toggleCollapse(); // auto-close offcanvas on selection
                                }}
                                ref={(el: HTMLAnchorElement | null) => {
                                    itemRefs.current[item.id] = el;
                                }}
                            >
                                {item.name}
                            </ListGroup.Item>
                        ))}
                        {filteredItems.length === 0 && (
                            <div className="text-muted p-2">No chapters found</div>
                        )}
                    </ListGroup>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default ChapterList;
