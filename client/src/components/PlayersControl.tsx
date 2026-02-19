import React from 'react';
import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const playersStyle: React.CSSProperties = {
    display: 'flex',
    height: 'auto',
    // marginBottom: '10px', // Removed for sticky bottom
    backgroundColor: '#d6c8a8',
    borderRadius: '8px',
    alignItems: 'center',
    justifyContent: 'space-around',
    fontFamily: "'Georgia',serif",
    color: "#4a3b1f",
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,.2)',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '10px',
};

const buttonStyle: React.CSSProperties = {
    backgroundColor: '#b59f63',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    color: '#3a2d0b',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,.15)',
    userSelect: 'none',
    flexShrink: 0
};

interface PlayersControlProps {
    selectedId: number;
    totalChapters: number;
    playerStatus: 0 | 1 | 2;
    speed: number;
    onPlayPause: () => void;
    onStop: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onForward: () => void;
    onBackForward: () => void;
    onSpeedChange: (speed: number) => void;
    onToggleChapters: () => void;
    onOpenSettings: () => void;
}

const getPlayerStatus = (playerStatus: number) => {
    switch (playerStatus) {
        case 1: return 'Playing';
        case 2: return 'Paused';
        case 0: return 'Stopped';
        default: return 'NA';
    }
};

const PlayersControl: React.FC<PlayersControlProps> = ({
    selectedId,
    totalChapters,
    playerStatus,
    speed, // Kept for now if we want to display it, but instructions imply moving control.
    onPlayPause,
    onStop,
    onNext,
    onPrevious,
    onForward,
    onBackForward,
    onSpeedChange,
    onToggleChapters,
    onOpenSettings,
}) => {
    const navigate = useNavigate();
    const handleDash = () => {
        navigate(`/dashboard`);
    };

    return (
        <Container fluid style={playersStyle}>

            <Button style={buttonStyle} onClick={onToggleChapters} aria-label="Toggle Chapters">
                <i className="bi bi-list" /> <span className="d-none d-sm-inline">Chapters</span>
            </Button>

            <Button
                style={{ ...buttonStyle, opacity: selectedId === 0 ? 0.5 : 1 }}
                onClick={onPrevious}
                disabled={selectedId === 0}
                aria-label="Previous Chapter"
            >
                <i className="bi bi-arrow-left-square-fill" /> <span className="d-none d-sm-inline">Previous</span>
            </Button>

            <Button style={buttonStyle} onClick={onBackForward} aria-label="Rewind">
                <i className="bi bi-rewind-fill" /> <span className="d-none d-sm-inline">Rewind</span>
            </Button>

            <Button style={buttonStyle} onClick={onPlayPause} aria-label={playerStatus === 1 ? 'Pause' : 'Play'}>
                {playerStatus === 1 ? (
                    <>
                        <i className="bi bi-pause-fill" /> <span className="d-none d-sm-inline">Pause</span>
                    </>
                ) : (
                    <>
                        <i className="bi bi-play-fill" /> <span className="d-none d-sm-inline">Play</span>
                    </>
                )}
            </Button>

            <Button style={buttonStyle} onClick={onStop} aria-label="Stop">
                <i className="bi bi-stop-fill" /> <span className="d-none d-sm-inline">Stop</span>
            </Button>

            <Button style={buttonStyle} onClick={onForward} aria-label="Forward">
                <i className="bi bi-fast-forward-fill" /> <span className="d-none d-sm-inline">Forward</span>
            </Button>

            <Button
                style={{ ...buttonStyle, opacity: selectedId === totalChapters - 1 ? 0.5 : 1 }}
                onClick={onNext}
                disabled={selectedId === totalChapters - 1}
                aria-label="Next Chapter"
            >
                <i className="bi bi-arrow-right-square-fill" /> <span className="d-none d-sm-inline">Next</span>
            </Button>

            <Button style={buttonStyle} onClick={onOpenSettings} aria-label="Settings">
                <i className="bi bi-gear-fill" /> <span className="d-none d-sm-inline">Settings</span>
            </Button>

            <Button style={buttonStyle} onClick={handleDash} aria-label="Dashboard">
                <i className="bi bi-house-door-fill" /> <span className="d-none d-sm-inline">DashBoard</span>
            </Button>

        </Container>
    );
};

export default PlayersControl;
