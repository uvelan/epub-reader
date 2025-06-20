import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ContentPanel from './ContentPanel';
import { Container, Row, Col } from 'react-bootstrap';

const sampleHtml: Record<string, string> = {
    'Item 1': '<p>This is <strong>HTML content</strong> for Item 1.</p>',
    'Item 2': '<p>This is content for <em>Item 2</em>.</p>',
    'Item 3': '<p>Another HTML block for Item 3.</p>',
};

const MainLayout: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState('Item 1');
    const [collapsed, setCollapsed] = useState(false);
    const [selectedDropdown, setSelectedDropdown] = useState('');

    const toggleCollapse = () => setCollapsed(!collapsed);
    const handlePlay = () => alert('Playing...');
    const handleNext = () => alert('Next item...');
    const handlePrevious = () => alert('Previous item...');

    return (
        <Container fluid className="p-0 d-flex vh-100">
            <Sidebar
                items={Object.keys(sampleHtml)}
                onSelect={setSelectedItem}
                collapsed={collapsed}
                toggleCollapse={toggleCollapse}
            />
            <ContentPanel
                htmlContent={sampleHtml[selectedItem]}
                dropdownItems={['Option A', 'Option B', 'Option C']}
                selectedDropdown={selectedDropdown}
                setSelectedDropdown={setSelectedDropdown}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onPlay={handlePlay}
            />
        </Container>
    );
};

export default MainLayout;
