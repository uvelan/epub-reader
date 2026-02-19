export class TextToSpeech {
    private synthesis: SpeechSynthesis;
    private isSpeaking = false;
    public onEnd: (() => void) | null = null;

    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private selectedVoice: SpeechSynthesisVoice | null = null;

    constructor(
        private voiceLang = 'en-US',
        private rate = 1.0
    ) {
        this.synthesis = window.speechSynthesis;
    }

    setRate(rate: number) {
        this.rate = rate;
        // Note: Changing rate mid-speech typically requires restarting in many browsers.
        // For now, this just updates the rate for the *next* utterance.
    }

    setVoiceLanguage(lang: string) {
        this.voiceLang = lang;
    }

    setVoice(URI: string) {
        const voices = this.synthesis.getVoices();
        const voice = voices.find(v => v.voiceURI === URI);
        if (voice) {
            this.selectedVoice = voice;
        }
    }

    speak(text: string) {
        // Always stop previous speech before starting new
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.rate;
        utterance.lang = this.voiceLang;

        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }

        utterance.onend = () => {
            this.isSpeaking = false;
            // Important: keep reference until end to prevent GC
            this.currentUtterance = null;
            if (this.onEnd) {
                this.onEnd();
            }
        };

        utterance.onerror = (event) => {
            console.error("TTS Error:", event);
            this.isSpeaking = false;
            this.currentUtterance = null;
        };

        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);
        this.isSpeaking = true;
    }

    pause() {
        if (this.synthesis.speaking && !this.synthesis.paused) {
            this.synthesis.pause();
        }
    }

    resume() {
        if (this.synthesis.paused) {
            this.synthesis.resume();
        }
    }

    stop() {
        if (this.synthesis.speaking || this.synthesis.paused || this.isSpeaking) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
        }
    }

    isPlaying() {
        return this.synthesis.speaking && !this.synthesis.paused;
    }

    isPaused() {
        return this.synthesis.paused;
    }
}
