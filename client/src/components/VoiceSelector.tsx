import React from "react";
import PopupMapForm from "./PopupMapForm";

interface VoiceSelectorProps {
    id: string;
    voices: SpeechSynthesisVoice[];
    selectedVoice: string;
    onChangeVoice: (voiceURI: string) => void;
    selectedChapter?: string;
    handlePopupSubmit?: () => void;
}

const voiceSelectorStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: '10px',
    backgroundColor: '#d6c8a8',
    borderRadius: '8px',
    alignItems: 'center',
    fontFamily: "'Georgia',serif",
    color: "#4a3b1f",
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,.2)',
    gap: '10px',
    padding: '10px',
    alignContent:'space-between'
};

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
                                                         voices,
                                                         selectedVoice,
                                                         onChangeVoice,
                                                         selectedChapter,
                                                            id,
                                                         handlePopupSubmit
                                                     }) => {
    const sortedVoices = [...voices].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
        <div style={voiceSelectorStyle}>
            <label htmlFor="voiceSelect" style={{ marginRight: 10 }}>
                Select Voice:
            </label>
            <select
                id="voiceSelect"
                onChange={(e) => onChangeVoice(e.target.value)}
                value={selectedVoice}
                disabled={voices.length === 0}
                style={{
                    fontFamily: "'Georgia', serif",
                    padding: "5px 10px",
                    border: "1px solid #b7a88e",
                    width: '100%',          // full width of parent
                    maxWidth: '300px',      // max size on larger screens
                    minWidth: '150px',      // ensures usability on small screens
                    boxSizing: 'border-box', // ensures padding doesn't overflow container
                    flexGrow: 1
                }}
            >
                {voices.length === 0 && (
                    <option disabled>No voices available</option>
                )}
                {sortedVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                    </option>
                ))}
            </select>
            <span className="d-none d-md-inline font-weight-semibold">
                {selectedChapter}
            </span>
            <PopupMapForm id={id} onSubmit={handlePopupSubmit} />
        </div>
       </>
    );
};

export default VoiceSelector;
