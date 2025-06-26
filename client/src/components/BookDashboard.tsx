import React, {useState, useMemo, useEffect} from 'react';
import UploadModal from './UploadModal';
import { useNavigate } from "react-router-dom";
import bookCover from '../assets/0.jpg'

import {
    Container,
    Row,
    Col,
    Button,
    Form,
    InputGroup,
    Pagination,
} from 'react-bootstrap';
import BookCard from './BookCard';
const baseUrl = process.env.REACT_APP_API_BASE_URL;

type Book = {
    id: string;
    title: string;
    text: string;
    cover: string;
    link: string;
    author: string;
};




const BookDashboard: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const navigate = useNavigate();
    const handleOnSuccess = () => {
        navigate(`/`);
    };
    useEffect(() => {
        fetch(`${baseUrl}/epub`)
            .then((res) => res.json())
            .then((data) => setBooks(data))
            .catch(console.error);
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
                <Col xs={12} md={6} className="d-flex justify-content-md-end mt-2 mt-md-0">
                    <Button onClick={() => setShowUploadModal(true)}>Add Book</Button>
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

            <Row xs={1} sm={2} md={3} className="g-4">
                {currentBooks.length > 0 ? (
                    currentBooks.map((book) => (
                        <Col key={book.id}>
                            <BookCard book={book} onDelete={handleDelete} />
                        </Col>
                    ))
                ) : (
                    <Col>
                        <p className="text-center">No books found.</p>
                    </Col>
                )}
            </Row>

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
