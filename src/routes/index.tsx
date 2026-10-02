import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Instagram, MapPin, MessageCircle, Volume2, VolumeX } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useInvitationSong } from "@/hooks/use-invitation-song";
import gateImage from "@/assets/mehndi-garden-gate.jpg";
import venueImage from "@/assets/secret-garden-venue.jpg";
import coupleImage from "@/assets/couple-dreamscape.jpg";
import twilightImage from "@/assets/twilight-celebration.jpg";
import hennaImage from "@/assets/mood-henna.jpg";
import jewelsImage from "@/assets/mood-jewels.jpg";
import textileImage from "@/assets/mood-textile.jpg";
import focusImage from "@/assets/dreamy-focus.jpg";

const EVENT = {
  date: "21 OCTOBER 2026",
  dateDay: "21",
  dateMonth: "OCTOBER",
  dateYear: "2026",
  time: "8:00 PM",
  venue: "GRAND HAYAT LUXURY BANQUET",
  hall: "BANQUET HALL B",
  address: "Main Continental Bakery Road, Gulistan-e-Johar, Block 3, Karachi",
  dressCode: "Pastels with a desi twist",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Grand+Hayat+Luxury+Banquet+Main+Continental+Bakery+Road+Gulistan+e+Johar+Block+3+Karachi",
  instagramUrl: "https://www.instagram.com/digital_invites_bymili/",
  whatsappUrl: "https://api.whatsapp.com/message/N24AWOP5IQURG1?autoload=1&app_absent=0",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fizza & Abdul Qadir — Mehndi" },
      { name: "description", content: "Fizza and Abdul Qadir invite you to their Mehndi celebration." },
      { property: "og:title", content: "Fizza & Abdul Qadir — Mehndi" },
      { property: "og:description", content: "Join us for an evening of love, laughter and Mehndi magic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Invitation,
});

const petals = Array.from({ length: 14 }, (_, index) => index);
const musicNotes = Array.from({ length: 8 }, (_, index) => index);

function ScratchDate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const scratchTicksRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const drawCover = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * ratio);
      canvas.height = Math.round(bounds.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const foil = context.createLinearGradient(0, 0, bounds.width, bounds.height);
      foil.addColorStop(0, "#ead7c0");
      foil.addColorStop(.45, "#d4af72");
      foil.addColorStop(.72, "#f3e3cf");
      foil.addColorStop(1, "#c99d62");
      context.fillStyle = foil;
      context.fillRect(0, 0, bounds.width, bounds.height);
      context.fillStyle = "rgba(255,255,255,.22)";
      for (let x = -bounds.height; x < bounds.width; x += 18) context.fillRect(x, 0, 5, bounds.height);
      context.fillStyle = "#59483e";
      context.textAlign = "center";
      context.font = "600 12px Montserrat, sans-serif";
      context.fillText("SCRATCH TO REVEAL", bounds.width / 2, bounds.height / 2 + 4);
    };

    drawCover();
    const resize = () => { if (!revealed) drawCover(); };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [revealed]);

  const revealAll = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
    setRevealed(true);
  };

  const getScratchedRatio = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
    // sample every 4th pixel for speed rather than reading every pixel
    const stride = 4;
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let sampled = 0;
    let cleared = 0;
    for (let i = 3; i < data.length; i += 4 * stride) {
      sampled += 1;
      if (data[i] === 0) cleared += 1;
    }
    return sampled ? cleared / sampled : 0;
  };

  const scratch = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isScratching || revealed) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const bounds = canvas.getBoundingClientRect();
    const ratio = canvas.width / bounds.width;
    context.save();
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(event.clientX - bounds.left, event.clientY - bounds.top, 24, 0, Math.PI * 2);
    context.fill();
    context.restore();

    // checking scratched coverage on every move is expensive, so only sample every few strokes
    scratchTicksRef.current += 1;
    if (scratchTicksRef.current % 5 === 0 && getScratchedRatio(canvas, context) >= 0.4) {
      revealAll();
    }
  };

 return (
    <div className={`scratch-date ${revealed ? "is-revealed" : ""}`}>
      <div className="date-values">
        <span className="date-day">{EVENT.dateDay}</span>
        <h2 data-cursor="SAVE THE DATE">{EVENT.dateMonth}</h2>
        <span className="date-year">{EVENT.dateYear}</span>
      </div>
      <canvas
        ref={canvasRef}
        className="scratch-cover"
        aria-label="Scratch to reveal the celebration date"
        role="button"
        tabIndex={0}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setIsScratching(true);
          scratch(event);
        }}
        onPointerMove={scratch}
        onPointerUp={() => setIsScratching(false)}
        onPointerCancel={() => setIsScratching(false)}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") revealAll(); }}
      />
    </div>
  );
}
 
function Invitation() {
 const [opened, setOpened] = useState(false);
  const [dholkiPlaying, setDholkiPlaying] = useState(false);
  const [writingName, setWritingName] = useState(false);
  const [entered, setEntered] = useState(false);
  const song = useInvitationSong("mehndi");
  const muted = !song.playing;
  const [bookPage, setBookPage] = useState(0);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    const root = sectionsRef.current;
    if (!root || !entered) return;
    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      targets.forEach((target) => {
        ScrollTrigger.create({
          trigger: target,
          start: "top 72%",
          end: "bottom 20%",
          invalidateOnRefresh: true,
          onEnter: () => target.classList.add("is-visible"),
          onEnterBack: () => target.classList.add("is-visible"),
          onLeaveBack: () => target.classList.remove("is-visible"),
        });
      });
      gsap.fromTo(".focus-layer", { filter: "blur(18px)", scale: 1.08 }, {
        filter: "blur(0px)", scale: 1, ease: "none",
        scrollTrigger: { trigger: ".focus-scene", start: "top 75%", end: "center 45%", scrub: true, invalidateOnRefresh: true },
      });
    }, root);
    return () => context.revert();
  }, [entered]);
 
  useEffect(() => {
    document.documentElement.classList.toggle("invitation-locked", !entered);
    document.body.classList.toggle("invitation-locked", !entered);
    if (entered) {
      window.scrollTo({ top: 0, behavior: "auto" });
      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    }
    return () => {
      document.documentElement.classList.remove("invitation-locked");
      document.body.classList.remove("invitation-locked");
    };
  }, [entered]);
 
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || window.matchMedia("(pointer: coarse)").matches) return;
    const move = (event: MouseEvent) => gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: 0.22, ease: "power2.out" });
    const label = (event: Event) => {
      const target = event.target as HTMLElement;
      cursor.dataset["label"] = target.closest<HTMLElement>("[data-cursor]")?.dataset["cursor"] ?? "";
    };
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", label);
    return () => { window.removeEventListener("mousemove", move); document.removeEventListener("mouseover", label); };
  }, []);
 
  return (
    <main ref={sectionsRef} className={`invitation-shell ${entered ? "has-entered" : "is-locked"}`}>
      {!entered && <section className={`gate-scene ${opened ? "is-open" : ""}`} aria-label="Welcome to the Mehndi celebration">
        <img src={gateImage} alt="A flower-covered garden gate opening onto a celebration pavilion" width={1280} height={1536} className="scene-image" />
        <div className="gate-shade" aria-hidden="true" />
        {petals.map((petal) => <span key={petal} className={`petal petal-${petal + 1}`} aria-hidden="true" />)}
        {song.ready && <button className="sound-control" type="button" onClick={song.toggle} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
          {muted ? <VolumeX /> : <Volume2 />}
        </button>}
        <div className="gate-copy">
          <p className="script-line">psst... something beautiful is waiting for you!</p>
          <h1>A LITTLE <span>Mehndi</span> MAGIC</h1>
          <p className="eyebrow">RING THE BELL TO ENTER</p>
        </div>
 <button data-cursor="ENTER" className="doorbell" type="button" onClick={() => { setOpened(true); song.start(); }} aria-label="Ring the bell and open the garden gate">
            <span className="bell-dot" aria-hidden="true" />
          <span>{opened ? "WELCOME IN" : "RING FOR JOY"}</span>
        </button>
        <button className="enter-button" type="button" onClick={() => { setEntered(true); song.start(); }}>
          Step inside
        </button>
      </section>}
 
 {entered && song.ready && <button className={`sound-fab ${song.playing ? "playing" : ""}`} type="button" onClick={song.toggle} data-cursor={muted ? "PLAY" : "PAUSE"} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
        {muted ? <VolumeX /> : <Volume2 />}
      </button>}


      {entered && <div className="invitation-content">
      <section id="hero" className="story-scene couple-scene" data-reveal>
        <div className="scene-background couple-layer"><img src={coupleImage} alt="Fizza and Abdul Qadir in a pastel Mehndi garden" width={1280} height={1536} /></div>
        <div className="detail-copy hero-copy">
          <h2><span>ABDUL QADIR</span><i>&</i><span>FIZZA</span></h2>
          <p className="hero-intro">together with their families<br />invite you to celebrate their Mehendi.</p>
        </div>
      </section>
 
      <section className="story-scene festive-scene" data-reveal>
          <div className="festive-notes" aria-hidden="true">
          {musicNotes.map((note) => <span key={note} className={`note note-${note + 1}`}>{note % 2 === 0 ? "♪" : "♫"}</span>)}
        </div>
        <div className="festive-stack">
          <div className="detail-copy festive-copy"><h2>A LITTLE MUSIC,<br />A LITTLE MEHNDI...</h2><p className="script-line">and a whole lot of happiness!</p></div>
          <div className={`mehndi-signature-center ${writingName ? "is-writing" : ""}`} aria-hidden="true">
            {"Fizza's Mehndi".split("").map((letter, index) => (
              <span key={index} className="mehndi-letter" style={{ "--i": index } as CSSProperties}>{letter === " " ? "\u00A0" : letter}</span>
            ))}
          </div>
          <div className="festive-cluster">
            <span className="dholki-hint" aria-hidden="true">✦ Tap to play ✦</span>
            <div className={`festive-tray ${writingName ? "is-writing" : ""}`} aria-hidden="true">
              <span className="bangle bangle-one" /><span className="bangle bangle-two" /><span className="henna-cone" />
            </div>
            <button
              data-cursor="PLAY"
              className={`dholki-ornament ${dholkiPlaying ? "is-playing" : ""}`}
              type="button"
              aria-label="Tap to play the dholki and see Fizza's mehndi"
              onClick={() => {
                if (writingName) return;
                setDholkiPlaying(true);
                setWritingName(true);
                window.setTimeout(() => setDholkiPlaying(false), 1400);
                window.setTimeout(() => setWritingName(false), 5000);
              }}
            ><span /><span /><span /></button>
          </div>
        </div></section>
 
      <section className="story-scene letter-scene" data-reveal>
        <div className="silk-fold" aria-hidden="true" />
        <div className="paper-florals letter-florals" aria-hidden="true"><i /><i /><i /></div>
        <div className="letter-ribbon" aria-hidden="true" />
        <div className="detail-copy letter-copy">
          <p className="eyebrow">DEAR FAMILY & FRIENDS,</p>
          <p className="letter-heading">Where Pastels Bloom & Celebrations Come Alive</p>
          <p>Get ready for a vibrant celebration where dreamy pastels meet endless entertainment! From fun-filled games and playful moments to music, dance, laughter, and surprises, this Mehndi is all about celebrating in the most colourful way. Dress in your prettiest pastels and join us for an evening where every moment is made to be enjoyed, celebrated, and remembered.</p>
          <p className="script-line">With love,<br />Fizza & Abdul Qadir</p>
        </div>
      </section>
 
      <section id="date" className="story-scene date-scene" data-reveal>
        <div className="decorative-layer" aria-hidden="true">
          <span className="date-frame" /><span className="bud bud-one" /><span className="bud bud-two" />
        </div>
        <div className="detail-copy date-copy">
          <p className="eyebrow">A DAY TO REMEMBER</p>
          <ScratchDate />
          <p className="script-line">One beautiful evening, a lifetime of lovely memories.</p>
        </div>
      </section>
 
      <section id="time" className="story-scene time-scene" data-reveal>
        <div className="sunset-field" aria-hidden="true"><span className="sun-disc" /><span className="organza-line organza-one" /><span className="organza-line organza-two" /></div>
        <div className="horizon-glow" aria-hidden="true" />
        <div className="evening-lights" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="detail-copy time-copy">
          <p className="eyebrow">WHEN THE MAGIC BEGINS</p>
          <h2>{EVENT.time}</h2>
          <span className="time-divider" aria-hidden="true" />
          <p>Join us for an evening filled with love, laughter and Mehndi magic.</p>
        </div>
      </section>
 
      <section id="venue" className="story-scene venue-scene" data-reveal>
        <div className="scene-background venue-layer"><img src={venueImage} alt="A flower-lined garden path leading to an elegant Mehndi pavilion" width={1280} height={1536} loading="lazy" /></div>
        <div className="venue-arch" aria-hidden="true"><span /><span /></div>
        <div className="detail-copy venue-copy">
          <p className="eyebrow">WHERE WE’LL CELEBRATE</p>
          <h2>{EVENT.venue}</h2>
          <p className="city">{EVENT.hall}</p>
          <p className="venue-address">{EVENT.address}</p>
          <p className="dress-code"><span>Dress Code</span>{EVENT.dressCode}</p>
          <a data-cursor="VIEW" className="venue-button" href={EVENT.mapUrl} target="_blank" rel="noopener noreferrer" aria-label="Find the venue on a map">
            <MapPin aria-hidden="true" /> FIND THE VENUE
          </a>
        </div>
      </section>
 
      <section className="mood-scene story-scene" data-reveal>
        <div className="mood-heading"><p className="eyebrow">A LITTLE BOOK OF</p><h2>Beautiful Details</h2></div>
        <div className="book-wrap" data-cursor="TURN PAGE" onTouchStart={(event) => { const touch = event.touches.item(0); if (touch) event.currentTarget.dataset["startX"] = String(touch.clientX); }} onTouchEnd={(event) => {
          const touch = event.changedTouches.item(0);
          if (!touch) return;
          const start = Number(event.currentTarget.dataset["startX"] ?? 0);
          if (start - touch.clientX > 40) setBookPage((page) => Math.min(2, page + 1));
          if (touch.clientX - start > 40) setBookPage((page) => Math.max(0, page - 1));
        }}>
          <div className={`book-page page-${bookPage}`}>
            {[
              { image: hennaImage, title: "Henna in bloom", note: "Intricate little stories, drawn by hand." },
              { image: jewelsImage, title: "Treasures & jasmine", note: "Pearls, pastel glass and a touch of gold." },
              { image: textileImage, title: "Threads of celebration", note: "Every stitch holds a little joy." },
            ].map((page, index) => <article key={page.title} className={index === bookPage ? "active" : ""}><img src={page.image} alt={page.title} width={1024} height={1280} loading="lazy" /><div><span>0{index + 1}</span><h3>{page.title}</h3><p>{page.note}</p></div></article>)}
          </div>
          <button className="book-nav prev" type="button" onClick={() => setBookPage((page) => Math.max(0, page - 1))} disabled={bookPage === 0} aria-label="Previous mood book page"><ChevronLeft /></button>
          <button className="book-nav next" type="button" onClick={() => setBookPage((page) => Math.min(2, page + 1))} disabled={bookPage === 2} aria-label="Next mood book page"><ChevronRight /></button>
        </div>
        <div className="page-dots" aria-label={`Mood book page ${bookPage + 1} of 3`}>{[0,1,2].map((page) => <button key={page} type="button" className={bookPage === page ? "active" : ""} onClick={() => setBookPage(page)} aria-label={`Go to page ${page + 1}`} />)}</div>
      </section>
 
      <section className="editorial-scene" data-reveal>
        <header className="editorial-heading"><p className="eyebrow">MOMENTS IN BLOOM</p><h2>A celebration,<br /><i>beautifully imagined</i></h2></header>
        <figure className="editorial-large"><img src={coupleImage} alt="A pastel Mehndi garden dreamscape" width={1280} height={1536} loading="lazy" /><figcaption>Love, dressed in colour</figcaption></figure>
        <figure className="editorial-small one"><img src={hennaImage} alt="Mehndi details on a bride's hands" width={1024} height={1280} loading="lazy" /><figcaption>Patterns made by hand</figcaption></figure>
        <figure className="editorial-small two"><img src={jewelsImage} alt="Pastel bangles and traditional jewellery" width={1024} height={1280} loading="lazy" /><figcaption>Little glimmers of joy</figcaption></figure>
        <p className="editorial-note">A day composed in petals, music and the softest light.</p>
      </section>
 
      <section className="story-scene focus-scene" data-reveal>
        <div className="scene-background focus-layer"><img src={focusImage} alt="A garden pavilion emerging through a soft organza veil" width={1280} height={1536} loading="lazy" /></div>
        <div className="detail-copy focus-copy"><p className="eyebrow">AND JUST LIKE THAT...</p><h2>A BEAUTIFUL<br />MEMORY BEGINS.</h2></div>
      </section>
 
      <section className="story-scene finale-scene" data-reveal>
        <div className="scene-background"><img src={twilightImage} alt="A glowing pastel Mehndi pavilion at twilight" width={1280} height={1536} loading="lazy" /></div>
        <div className="detail-copy finale-copy">
          <h2>ABDUL QADIR <i>&</i> FIZZA</h2><p className="final-date">{EVENT.date} · {EVENT.time}</p>
          <p className="script-line">An evening of love, laughter, music & memories awaits.</p><p>We’d be delighted to have you celebrate with us.</p>
          <div className="socials"><span>LET'S STAY CONNECTED</span><div>
            <a href={EVENT.instagramUrl} target="_blank" onClick={(event) => EVENT.instagramUrl === "#" && event.preventDefault()} aria-label="Instagram"><Instagram /> INSTAGRAM</a>
            <a href={EVENT.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle /> WHATSAPP</a>
          </div></div>
        </div>
      </section>
      </div>}
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true"><span>✦</span></div>
    </main>
  );
}
 