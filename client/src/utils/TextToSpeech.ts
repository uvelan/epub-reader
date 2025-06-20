export class TextToSpeech {
    private utterance: SpeechSynthesisUtterance;
    private synthesis: SpeechSynthesis;
    private isSpeaking = false;
    public onEnd: (() => void) | null = null;


    constructor(
        private voiceLang = 'en-US',
        private rate = 1.0
    ) {
        this.synthesis = window.speechSynthesis;
        this.utterance = new SpeechSynthesisUtterance();
        this.utterance.lang = this.voiceLang;
        this.utterance.rate = this.rate;

        this.utterance.onend = () => {
            this.isSpeaking = false;
        };
    }

    setRate(rate: number) {
        this.rate = rate;
        this.utterance.rate = rate;
    }

    setVoiceLanguage(lang: string) {
        this.voiceLang = lang;
        this.utterance.lang = lang;
    }

    speak(text: string) {
        if (this.isSpeaking) {
            this.stop();
        }
        this.utterance.text = text;
        this.utterance.onend = () => {
            if (this.onEnd) {
                this.onEnd();
            }
        };
        this.synthesis.speak(this.utterance);
        this.isSpeaking = true;
    }
    setVoice(URI: string) {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.voiceURI === URI);
        if (voice) {
            this.utterance.voice = voice;
        }
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
        if (this.synthesis.speaking || this.synthesis.paused) {
            this.synthesis.cancel();
            this.isSpeaking = false;
        }
    }

    isPlaying() {
        return this.synthesis.speaking && !this.synthesis.paused;
    }

    isPaused() {
        return this.synthesis.paused;
    }

}
