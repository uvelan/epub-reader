import React from "react";
import { Card, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface Book {
    id: string;
    title: string;
    text: string;
    cover: string;
    link: string;
    author: string;
}

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
                variant="top"
                src={book.cover || "/placeholder.jpg"}
                alt={book.title}
                style={{ objectFit: "cover", height: "200px" }}
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

                <Card.Text>{book.author}</Card.Text>

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
