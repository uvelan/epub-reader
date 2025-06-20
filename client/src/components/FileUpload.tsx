import React, { useState } from 'react';
import { Button, Form, Card, ListGroup, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
const baseUrl = process.env.REACT_APP_API_BASE_URL;

interface Chapter {
    id: string;
    name: string;
    content: string;
}

const FileUpload: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [jsonOutput, setJsonOutput] = useState<string>('');
    const { token } = useAuth();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type === 'application/epub+zip' || file.name.endsWith('.epub')) {
                setSelectedFile(file);
                setError(null);
                setChapters([]);
                setJsonOutput('');
            } else {
                setError('Please select an EPUB file');
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !token) return;

        setIsProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('epub', selectedFile);

            const response = await axios.post(`${baseUrl}/api/epub`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setChapters(response.data.chapters);
            setJsonOutput(response.data.json);

        } catch (err) {
            // @ts-ignore
            setError(err.response?.data?.error || 'Error processing EPUB file');
            console.error('Upload error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadJson = () => {
        if (!jsonOutput) return;

        const blob = new Blob([jsonOutput], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile ? `${selectedFile.name.replace('.epub', '')}.json` : 'chapters.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="mt-4">
            <Card.Body>
                <Card.Title>EPUB to JSON Converter</Card.Title>

                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Select EPUB File</Form.Label>
                    <Form.Control
                        type="file"
                        accept=".epub,application/epub+zip"
                        onChange={handleFileChange}
                    />
                </Form.Group>

                {selectedFile && (
                    <div className="mb-3">
                        <p>Selected file: {selectedFile.name}</p>
                        <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                )}

                {error && <Alert variant="danger">{error}</Alert>}

                <Button
                    variant="primary"
                    onClick={handleUpload}
                    disabled={!selectedFile || isProcessing}
                    className="me-2"
                >
                    {isProcessing ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            <span className="ms-2">Processing...</span>
                        </>
                    ) : 'Process EPUB'}
                </Button>

                {jsonOutput && (
                    <Button variant="success" onClick={handleDownloadJson} className="mt-2">
                        Download JSON
                    </Button>
                )}

                {chapters.length > 0 && (
                    <div className="mt-4">
                        <h5>Extracted Chapters ({chapters.length})</h5>
                        <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {chapters.map((chapter) => (
                                <ListGroup.Item key={chapter.id}>
                                    <strong>{chapter.name}</strong>
                                    <p className="text-muted mt-1">{chapter.content}</p>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                )}

                {jsonOutput && (
                    <div className="mt-4">
                        <h5>JSON Output</h5>
                        <pre style={{
                            backgroundColor: '#f8f9fa',
                            padding: '1rem',
                            borderRadius: '0.25rem',
                            maxHeight: '300px',
                            overflow: 'auto'
                        }}>
              {jsonOutput}
            </pre>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default FileUpload;