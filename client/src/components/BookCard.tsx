import React from "react";
import { Card, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import bookCover from '../assets/0.jpg'
import {Book} from "../types";

interface BookCardProps {
    book: Book;
    onDelete: (id: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onDelete }) => {
    const navigate = useNavigate();
    const handleRead = () => {
        navigate(`/book/${book.id}`);
    };
    return (
        <Card className="h-100">
            <Card.Img
                variant="card-img-top"
                src={book.cover || bookCover}
                alt={book.title}
                style={{ objectFit: "fill", height: "200px" }}
            />
            <Card.Body>
                <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>{book.title}</Tooltip>}
                >
                    <Card.Title
                        style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                        }}
                    >
                        {book.title}
                    </Card.Title>

                </OverlayTrigger>

                <Card.Text  style={{ maxHeight: '150px', overflowY: 'auto' }}>{book.description}</Card.Text>

                <div className="d-flex justify-content-between">
                    <Button variant="primary" onClick={handleRead}>
                        Read
                    </Button>
                    <Button variant="danger" onClick={() => onDelete(book.id)}>
                        Delete
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default BookCard;
