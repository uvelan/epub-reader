import React from "react";

interface VoiceSelectorProps {
    voices: SpeechSynthesisVoice[];
    selectedVoice: string;
    onChangeVoice: (voiceURI: string) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
                                                         voices,
                                                         selectedVoice,
                                                         onChangeVoice,
                                                     }) => {
    const sortedVoices = [...voices].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="mb-3" style={{ fontFamily: "'Georgia', serif" }}>
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
        </div>
    );
};

export default VoiceSelector;
