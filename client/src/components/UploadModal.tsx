import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";

interface UploadModalProps {
    show: boolean;
    onHide: () => void;
    onSuccess?: () => void; // optional: trigger refresh after upload
}

const UploadModal: React.FC<UploadModalProps> = ({ show, onHide, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError("");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select an EPUB file.");
            return;
        }

        const formData = new FormData();
        formData.append("epub", file);

        try {
            setUploading(true);
            setError("");

            const res = await axios.post("http://localhost:5000/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.status === 200) {
                onSuccess?.();
                onHide();
            } else {
                setError("Upload failed.");
            }
        } catch (err) {
            setError("Error uploading file.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Upload EPUB</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formFile">
                        <Form.Label>Select an EPUB file</Form.Label>
                        <Form.Control type="file" accept=".epub" onChange={handleFileChange} />
                    </Form.Group>
                    {error && <div className="text-danger mt-2">{error}</div>}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={uploading}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleUpload} disabled={uploading}>
                    {uploading ? <Spinner animation="border" size="sm" /> : "Upload"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UploadModal;
