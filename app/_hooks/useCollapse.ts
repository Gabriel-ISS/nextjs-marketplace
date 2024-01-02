import { useState } from "react";


interface Props {
  openByDefault?: boolean
  onOpening?: () => void
  onCloseEnd?: () => void
}

/**
 * - State va en el elemento a plegar en el atributo data-state y sirve para comunicarle a css los estilos que debe utilizar
 * - El elemento a plegar debe incluir el mixin collapsible
 * - El hijo del elemento plegable debe tener un overflow hidden
 */
export default function useCollapse({
  openByDefault = false,
  onOpening = () => void 0,
  onCloseEnd = () => void 0
}: Props = {}) {
  // Controla el estado del elemento a esconder
  const [state, setState] = useState<'closed' | 'opened' | 'start-opening' | 'opening' | 'closing'>(openByDefault ? 'opened' : 'closed');
  // Para saber si esta abriendo o esta abierto
  const isActive = state === 'opened' || state === 'opening'
  //Para accesibilidad
  const [ariaExpanded, setArialExpanded] = useState(openByDefault);

  function startOpen() {
    onOpening()
    setState('start-opening')
    setTimeout(() => {
      setState('opening')
    }, 10); // importante
  }

  function startClose() {
    setState('closing')
  }

  function endOpen() {
    setArialExpanded(true)
    setState('opened')
  }

  function endClose() {
    onCloseEnd()
    setArialExpanded(false)
    setState('closed')
  }

  function toggleState() {
    switch (state) {
      case 'closed':
        startOpen()
        break;
      case 'opened':
        startClose()
        break;
    }
  }

  function handleTransitionEnd() {
    switch (state) {
      case 'opening':
        endOpen()
        break;
      case 'closing':
        endClose()
        break;
    }
  }

  return { state, isActive, ariaExpanded, toggleState, startOpen, startClose, handleTransitionEnd };
}
