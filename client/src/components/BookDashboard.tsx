import React, { useState, useMemo, useEffect } from 'react';
import UploadModal from './UploadModal';
import { useNavigate } from "react-router-dom";
import { saveBooksToDB, getBooksFromDB, clearBooksFromDB, getOfflinePref, saveOfflinePref } from '../utils/db';

import {
    Container,
    Row,
    Col,
    Button,
    Form,
    InputGroup,
    Pagination,
    Alert,
} from 'react-bootstrap';
import BookCard from './BookCard';
import { Book } from "../types";
const baseUrl = process.env.REACT_APP_API_BASE_URL;


const BookDashboard: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Initialize from storage or default true
    const [isManualOffline, setIsManualOffline] = useState(getOfflinePref());
    const [isOfflineMode, setIsOfflineMode] = useState(false); // automated offline detection
    const [pendingUpdate, setPendingUpdate] = useState<Book[] | null>(null);
    const navigate = useNavigate();
    const handleOnSuccess = () => {
        navigate(`/`);
    };
    useEffect(() => {
        const loadBooks = async () => {
            setLoading(true);
            setIsOfflineMode(false);
            setPendingUpdate(null);
            setError(null);

            let cachedLoaded = false;

            // 1. Load Cache Immediately
            try {
                const cached = await getBooksFromDB();
                if (cached.length > 0) {
                    setBooks(cached);
                    cachedLoaded = true;
                    setLoading(false); // Show cached content immediately
                }
            } catch (e) {
                console.warn("Cache load failed", e);
            }

            // 2. Fetch from API (Background)
            if (!getOfflinePref()) {
                try {
                    const res = await fetch(`${baseUrl}/epub`);
                    if (!res.ok) throw new Error('Failed to fetch books');
                    const data = await res.json();

                    if (!cachedLoaded) {
                        setBooks(data);
                        await saveBooksToDB(data);
                        setLoading(false);
                    } else {
                        // Cache loaded, check if we should prompt
                        // Ideally check for diff, but for now just prompt
                        setPendingUpdate(data);
                    }

                } catch (err) {
                    console.error("Failed to fetch from server", err);
                    if (!cachedLoaded) {
                        setError("Failed to load books. Please check your connection.");
                    } else {
                        setIsOfflineMode(true);
                    }
                } finally {
                    if (!cachedLoaded) setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        loadBooks();
    }, []);
    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this book?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`${baseUrl}/epub/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setBooks(prev => prev.filter(book => book.id !== id));
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };
    const booksPerPage = 9;

    const filteredBooks = useMemo(() => {
        if (!Array.isArray(books)) return [];
        return books.filter(
            (book) =>
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, books]);

    const indexOfLast = currentPage * booksPerPage;
    const indexOfFirst = indexOfLast - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };


    return (
        <>
            <Container className="py-4">
                <Row className="mb-3 align-items-center">
                    <Col xs={12} md={6}>
                        <h2 className="mb-0">Book Dashboard</h2>
                    </Col>
                    <Col xs={12} md={6} className="d-flex justify-content-md-end gap-2 mt-2 mt-md-0">
                        <Button onClick={() => setShowUploadModal(true)}>Add Book</Button>
                        <Button
                            variant="outline-danger"
                            onClick={async () => {
                                await clearBooksFromDB();
                                alert("Cache cleared!");
                            }}
                        >
                            Clear Cache
                        </Button>
                        <div className="d-flex align-items-center ms-2">
                            <Form.Check
                                type="switch"
                                id="offline-switch"
                                label="Offline Mode"
                                checked={isManualOffline}
                                onChange={(e) => {
                                    const val = e.target.checked;
                                    setIsManualOffline(val);
                                    saveOfflinePref(val);
                                    if (!val) {
                                        // If switching to Online, reload/fetch
                                        window.location.reload();
                                    }
                                }}
                            />
                        </div>
                    </Col>
                </Row>


                <Row className="mb-3">
                    <Col md={6}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search by title or author..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </InputGroup>
                    </Col>
                </Row>

                {isOfflineMode && (
                    <Alert variant="warning" dismissible onClose={() => setIsOfflineMode(false)} className="mb-4">
                        Offline Mode: Showing cached books. Some actions may be unavailable.
                    </Alert>
                )}

                {pendingUpdate && (
                    <Alert variant="info" className="mb-4">
                        New books available from server.
                        <Button variant="link" size="sm" onClick={async () => {
                            setBooks(pendingUpdate);
                            await saveBooksToDB(pendingUpdate);
                            setPendingUpdate(null);
                            alert("Library updated!");
                        }}>Refresh List</Button>
                        <Button variant="link" size="sm" className="text-muted" onClick={() => setPendingUpdate(null)}>Dismiss</Button>
                    </Alert>
                )}

                {loading && books.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center py-5 text-danger">
                        <p>{error}</p>
                        <Button variant="outline-primary" onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                ) : (
                    <Row xs={1} sm={2} md={3} className="g-4">
                        {currentBooks.length > 0 ? (
                            currentBooks.map((book) => (
                                <Col key={book.id}>
                                    <BookCard book={book} onDelete={handleDelete} />
                                </Col>
                            ))
                        ) : (
                            <Col xs={12}>
                                <p className="text-center text-muted">No books found matching your search.</p>
                            </Col>
                        )}
                    </Row>
                )}

                {totalPages > 1 && (
                    <Pagination className="justify-content-center mt-4">
                        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                        {Array.from({ length: totalPages }, (_, i) => (
                            <Pagination.Item
                                key={i + 1}
                                active={i + 1 === currentPage}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                    </Pagination>
                )}
            </Container>
            <UploadModal
                show={showUploadModal}
                onHide={() => setShowUploadModal(false)}
                onSuccess={handleOnSuccess}
            />
        </>
    );
};

export default BookDashboard;
