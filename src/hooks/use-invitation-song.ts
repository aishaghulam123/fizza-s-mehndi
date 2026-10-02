import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSongUrl } from "@/lib/songs";

/**
 * Background song for one invitation.
 * - Loads the latest uploaded song from Firestore.
 * - Browsers only allow sound after a tap, so call `play()` from a click handler.
 *   If the guest taps before the song has finished loading, it starts as soon as it is ready.
 * - Pauses when the guest leaves the tab / locks the phone and resumes when they return.
 */
export function useInvitationSong(invitationId: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wantPlay = useRef(false); // guest already tapped, start when loaded
  const userPaused = useRef(false); // guest deliberately paused
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    audioRef.current = audio;
    let cancelled = false;
    let resumeAfterHidden = false;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVisibility = () => {
      if (document.hidden) {
        resumeAfterHidden = !audio.paused;
        audio.pause();
      } else if (resumeAfterHidden && !userPaused.current) {
        audio.play().catch(() => {});
      }
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    document.addEventListener("visibilitychange", onVisibility);

    fetchSongUrl(invitationId)
      .then((url) => {
        if (cancelled || !url) return; // no song uploaded: stay silent, no button
        audio.preload = "auto";
        audio.src = url;
        setReady(true);
        if (wantPlay.current && !userPaused.current) audio.play().catch(() => {});
      })
      .catch((error) => {
        // "The query requires an index" -> create it from the link in this message.
        console.error("Could not load the invitation song:", error);
      });

    return () => {
      cancelled = true;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisibility);
      audioRef.current = null;
    };
  }, [invitationId]);

  const play = useCallback(() => {
    userPaused.current = false;
    wantPlay.current = true;
    const audio = audioRef.current;
    if (audio && audio.getAttribute("src")) audio.play().catch(() => {});
  }, []);

  // Auto-start from a tap on some other control (doorbell, "Step inside"...).
  // Unlike play(), it does NOT override a pause/mute the guest chose on purpose.
  const start = useCallback(() => {
    if (userPaused.current) return;
    wantPlay.current = true;
    const audio = audioRef.current;
    if (audio && audio.getAttribute("src")) audio.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    userPaused.current = true;
    wantPlay.current = false;
    audioRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    pause();
    const audio = audioRef.current;
    if (audio) audio.currentTime = 0;
  }, [pause]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) pause();
    else play();
  }, [play, pause]);

  return { ready, playing, play, start, pause, stop, toggle };
}
