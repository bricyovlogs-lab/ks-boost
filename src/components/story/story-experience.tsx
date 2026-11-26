"use client";

import { useEffect, useRef } from "react";

type Props = { onBuy: () => void };

/**
 * Página inicial: a tela fica fixa enquanto você rola e só troca entre 3 cenas
 * (placa de vídeo → memória → placa no pedestal). Sem WebGL, os textos continuam funcionando.
 */
export function StoryExperience({ onBuy }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const fpsRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const story = storyRef.current;
    const stage = stageRef.current;
    if (!story || !stage) return;
    let disposed = false;
    let api: { destroy: () => void } | null = null;

    const sceneOf = () => {
      const r = story.getBoundingClientRect();
      const p = -r.top / Math.max(1, r.height - window.innerHeight);
      const next = p < 0.34 ? "0" : p < 0.67 ? "1" : "2";
      if (stage.dataset.scene !== next) stage.dataset.scene = next;
    };
    window.addEventListener("scroll", sceneOf, { passive: true });
    sceneOf();

    import("./scene")
      .then(({ createStoryScene }) => {
        if (disposed || !canvasRef.current || !bgRef.current) return;
        try {
          api = createStoryScene({
            canvas: canvasRef.current,
            story,
            background: bgRef.current,
            words: { hero: heroRef.current, fps: fpsRef.current, glow: glowRef.current },
            modelsBase: "/models/",
          });
        } catch {
          canvasRef.current.style.display = "none";
        }
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      window.removeEventListener("scroll", sceneOf);
      api?.destroy();
    };
  }, []);

  return (
    <div className="vx-story" ref={storyRef}>
      <div className="vx-stage" ref={stageRef} data-scene="0">
        <div className="vx-bg" ref={bgRef} />
        <div className="vx-words" aria-hidden="true">
          <div className="vx-glow" ref={glowRef} />
          <div className="vx-giant vx-giant--hero" ref={heroRef}>VKS BOOST</div>
          <div className="vx-giant vx-giant--fps" ref={fpsRef}>FPS</div>
        </div>
        <canvas className="vx-canvas" ref={canvasRef} />

        <div className="vx-panels">
          <div className="vx-panel vx-panel--0">
            <div className="vx-hero-copy">
              <div className="vx-eyebrow vx-fade">Performance gamer premium</div>
              <h1 className="vx-title vx-fade vx-d1">Seu PC no<br /><em>modo competitivo.</em></h1>
              <p className="vx-text vx-fade vx-d2">Mais FPS, menos input lag e zero travada. Windows, placa de vídeo e rede ajustados em um clique.</p>
              <div className="vx-actions vx-fade vx-d3">
                <button className="vx-btn vx-btn--red" type="button" onClick={onBuy}>Comprar agora</button>
                <a className="vx-btn vx-btn--ghost" href="#planos">Ver planos</a>
              </div>
              <div className="vx-trust vx-fade vx-d3"><span>Key na hora</span><span>Ponto de restauração</span><span>Reverte em 1 clique</span></div>
            </div>
            <div className="vx-scroll vx-fade">ROLE</div>
          </div>

          <div className="vx-panel vx-panel--1">
            <div className="vx-side vx-side--left">
              <div className="vx-eyebrow vx-fade">Boost FPS · Memory</div>
              <h2 className="vx-title vx-fade vx-d1">Mais FPS.<br /><em>Menos lag.</em></h2>
              <p className="vx-text vx-fade vx-d2">Energia no máximo, RAM liberada e o jogo em prioridade alta. O jogo aberto, o Discord e o anti-cheat nunca são tocados.</p>
            </div>
            <div className="vx-stats">
              <div className="vx-stat vx-fade vx-d1"><strong>14</strong><span>ajustes de input lag para mouse, teclado e monitor</span></div>
              <div className="vx-stat vx-fade vx-d2"><strong>1</strong><span>clique para otimizar o PC inteiro</span></div>
            </div>
          </div>

          <div className="vx-panel vx-panel--2">
            <div className="vx-side vx-side--left">
              <div className="vx-eyebrow vx-fade">Pronto em minutos</div>
              <h2 className="vx-title vx-fade vx-d1">Instale.<br />Ative. <em>Jogue.</em></h2>
              <p className="vx-text vx-fade vx-d2">A key é reconhecida na hora. Antes de qualquer ajuste o app cria um ponto de restauração, e você reverte tudo em um clique.</p>
              <div className="vx-actions vx-fade vx-d3">
                <button className="vx-btn vx-btn--red" type="button" onClick={onBuy}>Comprar agora</button>
                <a className="vx-btn vx-btn--ghost" href="#planos">Ver planos</a>
              </div>
            </div>
          </div>
        </div>
        <div className="vx-dots" aria-hidden="true"><span /><span /><span /></div>
      </div>
    </div>
  );
}
