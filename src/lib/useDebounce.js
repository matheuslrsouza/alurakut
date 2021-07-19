import { useRef } from "react";

export default function useDebounce(handle, tempoDeDelay) {

    const refIdTimeout = useRef(null);

    function controlador(...args) {
        window.clearTimeout(refIdTimeout.current);

        refIdTimeout.current = window.setTimeout(() => {
            handle(...args);
        }, tempoDeDelay);
    }

    return controlador;
}