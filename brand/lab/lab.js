(() => {
  "use strict";

  const root = document.getElementById("character-lab");
  const moth = document.getElementById("moth");
  const performer = document.getElementById("character-motion");
  const scene = document.getElementById("character-scene");
  const technicalDetails = document.getElementById("nerdy-details");
  const artStatus = document.getElementById("art-status");
  const playButton = document.getElementById("play-story");
  const playLabel = document.getElementById("play-label");
  const playSymbol = playButton.querySelector(".lab-play-symbol");
  const playNote = document.getElementById("play-note");
  const motionInput = document.getElementById("motion-enabled");
  const announce = document.getElementById("lab-announcement");
  const poseButtons = [...root.querySelectorAll("button[data-pose]")];
  const themeButtons = [...root.querySelectorAll("button[data-theme]")];
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const appearancePreference = window.matchMedia("(prefers-color-scheme: dark)");

  // Poses never select a project or change its copy, status, or destination.
  const poses = {
    hello: { label: "Hello", alt: "The heyNag moth waving hello" },
    curious: { label: "Curious", alt: "The heyNag moth leaning in with curious antennae" },
    thinking: { label: "Thinking", alt: "The heyNag moth pausing with a hand under its chin", refinedAlt: "The heyNag moth thinking in glasses, one arm supporting its elbow and a hand under its chin" },
    aha: { label: "Aha!", alt: "The heyNag moth delighted by an idea, with a small lightbulb beside it" },
    sharing: { label: "Sharing", alt: "The heyNag moth smiling and presenting the idea with an open hand" },
    oops: { label: "Oops", alt: "The heyNag moth reacting with a rueful little smile" }
  };

  let selectedPose = "hello";
  let motionEnabled = !motionPreference.matches;
  let themeChosen = false;
  let playing = false;
  let hasPlayed = false;
  let atlasReady = false;
  let gestureFrame = 0;
  let storyTimers = [];

  function speak(text) { announce.textContent = text; }

  function setTheme(theme) {
    document.documentElement.dataset.hnTheme = theme;
    themeButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.theme === theme)));
  }

  function clearStoryTimers() {
    storyTimers.forEach(window.clearTimeout);
    storyTimers = [];
  }

  function renderPlayButton() {
    playLabel.textContent = playing ? "Stop the thought" : !motionEnabled ? "Show the final pose" : hasPlayed ? "Replay the thought" : "Play the thought";
    playSymbol.textContent = playing ? "■" : "▶";
    playNote.textContent = playing ? "A thought in progress." : motionEnabled ? "Notice. Think. Share." : "An expressive still, with motion off.";
  }

  function clearGesture() {
    window.cancelAnimationFrame(gestureFrame);
    performer.removeAttribute("data-gesture");
    scene.removeAttribute("data-cue");
  }

  function gesture(pose) {
    clearGesture();
    if (!motionEnabled) return;
    gestureFrame = window.requestAnimationFrame(() => {
      gestureFrame = window.requestAnimationFrame(() => {
        if (motionEnabled) {
          performer.dataset.gesture = pose;
          scene.dataset.cue = pose;
        }
      });
    });
  }

  function setPose(pose, { animate = true, announceChange = false } = {}) {
    const details = poses[pose];
    if (!details) return;
    selectedPose = pose;
    moth.dataset.pose = pose;
    scene.dataset.pose = pose;
    const description = root.dataset.atlasVersion === "v2" && details.refinedAlt ? details.refinedAlt : details.alt;
    moth.setAttribute("aria-label", atlasReady ? description : "The heyNag moth in its welcoming pose");
    poseButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.pose === pose)));
    if (animate && atlasReady) gesture(pose);
    else clearGesture();
    if (announceChange) speak(description);
  }

  function stopStory({ tell = false } = {}) {
    clearStoryTimers();
    playing = false;
    clearGesture();
    renderPlayButton();
    if (tell) speak(`Character moment stopped. ${poses[selectedPose].label} expression.`);
  }

  function finishStory() {
    clearStoryTimers();
    playing = false;
    setPose("sharing", { animate: false });
    renderPlayButton();
    speak("Sharing pose. The character moment has finished.");
  }

  function playStory() {
    if (!atlasReady) return;
    if (playing) {
      stopStory({ tell: true });
      return;
    }
    stopStory();
    hasPlayed = true;
    if (!motionEnabled) {
      finishStory();
      return;
    }
    playing = true;
    renderPlayButton();
    setPose("curious");
    speak("The moth notices a question, thinks, and shares an idea. This character moment lasts four and a half seconds.");
    storyTimers = [
      window.setTimeout(() => setPose("thinking"), 1300),
      window.setTimeout(() => setPose("aha"), 2450),
      window.setTimeout(() => setPose("sharing"), 3450),
      window.setTimeout(finishStory, 4500)
    ];
  }

  function setMotion(enabled) {
    motionEnabled = enabled;
    motionInput.checked = enabled;
    root.dataset.motion = enabled ? "on" : "off";
    if (!enabled) {
      if (playing) finishStory();
      else clearGesture();
    }
    renderPlayButton();
  }

  poseButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      stopStory();
      setPose(button.dataset.pose, { announceChange: true });
    });
    button.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % poseButtons.length;
      if (event.key === "ArrowLeft") next = (index + poseButtons.length - 1) % poseButtons.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = poseButtons.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      poseButtons[next].focus();
      poseButtons[next].click();
    });
  });

  technicalDetails.addEventListener("toggle", () => {
    stopStory();
    setPose(technicalDetails.open ? "thinking" : "hello");
  });

  themeButtons.forEach(button => button.addEventListener("click", () => {
    themeChosen = true;
    setTheme(button.dataset.theme);
  }));
  motionInput.addEventListener("change", () => {
    setMotion(motionInput.checked);
    speak(motionEnabled ? "Motion enabled. Choose an expression or play the thought." : "Motion off. All expressions, technical details, and project links remain available.");
  });
  playButton.addEventListener("click", playStory);
  root.addEventListener("keydown", event => {
    if (event.key === "Escape" && playing) stopStory({ tell: true });
  });
  performer.addEventListener("animationend", event => {
    if (event.target === performer) clearGesture();
  });
  appearancePreference.addEventListener("change", event => {
    if (!themeChosen) setTheme(event.matches ? "dark" : "light");
  });
  motionPreference.addEventListener("change", event => {
    if (event.matches) setMotion(false);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && playing) stopStory();
  });
  window.addEventListener("pagehide", () => stopStory());

  setTheme(appearancePreference.matches ? "dark" : "light");
  setMotion(motionEnabled);
  setPose("hello", { animate: false });

  // This retained study uses V2 artwork, with the original atlas as a fallback.
  // V5 character review lives separately in brand/character-proof/.
  const master = new Image();
  master.onload = () => root.style.setProperty("--lab-master", 'url("../../assets/brand/heynag-moth-v2.png")');
  master.src = "../../assets/brand/heynag-moth-v2.png";

  function loadAtlas(version) {
    const source = version === "v2" ? "../../assets/brand/moth-poses-v2.png" : "../../assets/brand/moth-poses.png";
    const atlas = new Image();
    atlas.onload = () => {
      atlasReady = true;
      root.style.setProperty("--lab-atlas", `url("${source}")`);
      root.dataset.atlas = "ready";
      root.dataset.atlasVersion = version;
      artStatus.hidden = version === "v2";
      artStatus.textContent = version === "v2" ? "" : "Original expression atlas fallback. This is an earlier study, separate from the current V5 character.";
      poseButtons.forEach(button => button.disabled = false);
      playButton.disabled = false;
      setPose(selectedPose, { animate: false });
    };
    atlas.onerror = () => {
      if (version === "v2") {
        loadAtlas("legacy");
        return;
      }
      root.dataset.atlas = "unavailable";
      artStatus.textContent = "The expression artwork is unavailable. Showing the welcoming character.";
      artStatus.hidden = false;
    };
    atlas.src = source;
  }
  loadAtlas("v2");
})();
