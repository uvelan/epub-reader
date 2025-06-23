import React from 'react';
import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const playersStyle: React.CSSProperties = {
    display: 'flex',
    height: 'auto',
    marginBottom: '10px',
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
    sentenceIndex: number;
    sentenceCount: number;
    speed: number;
    onPlayPause: () => void;
    onStop: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onForward: () => void;
    onBackForward: () => void;
    onSpeedChange: (speed: number) => void;
    onToggleChapters: () => void;
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
                                                           sentenceIndex,
                                                           sentenceCount,
                                                           speed,
                                                           onPlayPause,
                                                           onStop,
                                                           onNext,
                                                           onPrevious,
                                                           onForward,
                                                           onBackForward,
                                                           onSpeedChange,
                                                           onToggleChapters,
                                                       }) => {
    const navigate = useNavigate();
    const handleDash = () => {
        navigate(`/dashboard`);
    };

    return (
        <Container fluid  style={playersStyle}>
            <Button style={buttonStyle} onClick={onToggleChapters}>
                <i className="bi bi-list" /> Chapters
            </Button>
            <Button
                style={{ ...buttonStyle, opacity: selectedId === 0 ? 0.5 : 1 }}
                onClick={onPrevious}
                disabled={selectedId === 0}
            >
                <i className="bi bi-arrow-left-square-fill"></i> Previous
            </Button>

            <Button style={buttonStyle} onClick={onBackForward}>
                <i className="bi bi-rewind-fill"></i> Rewind
            </Button>

            <Button style={buttonStyle} onClick={onPlayPause}>
                {playerStatus === 1 ? (
                    <>
                        <i className="bi bi-pause-fill"></i> Pause
                    </>
                ) : (
                    <>
                        <i className="bi bi-play-fill"></i> Play
                    </>
                )}
            </Button>

            <Button style={buttonStyle} onClick={onStop}>
                <i className="bi bi-stop-fill"></i> Stop
            </Button>

            <Button style={buttonStyle} onClick={onForward}>
                <i className="bi bi-fast-forward-fill"></i> Forward
            </Button>

            <Button
                style={{ ...buttonStyle, opacity: selectedId === totalChapters ? 0.5 : 1 }}
                onClick={onNext}
                disabled={selectedId === totalChapters}
            >
                <i className="bi bi-arrow-right-square-fill"></i> Next
            </Button>

            <Button style={buttonStyle} onClick={handleDash}>
                <i className="bi bi-book"></i> DashBoard
            </Button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '160px' }}>
                <label htmlFor="speed-slider" style={{ fontSize: '0.9rem' }}>
                    Speed: {speed.toFixed(1)}x
                </label>
                <input
                    id="speed-slider"
                    type="range"
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    value={speed}
                    onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>
        </Container>
    );
};

export default PlayersControl;
