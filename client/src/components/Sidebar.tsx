import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaBeer } from 'react-icons/fa';

type SidebarProps = {
    items: string[];
    onSelect: (item: string) => void;
    collapsed: boolean;
    toggleCollapse: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ items, onSelect, collapsed, toggleCollapse }) => {
    return (
        <div style={{ width: collapsed ? '60px' : '20%', transition: 'width 0.3s', height : '100vh'}} className="bg-light border-end">
            <Button variant="link" onClick={toggleCollapse} className="m-2">
                <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
            </Button>
            {!collapsed && (
                <ListGroup>
                    {items.map((item, idx) => (
                        <ListGroup.Item key={idx} action onClick={() => onSelect(item)}>
                            {item}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};

export default Sidebar;
