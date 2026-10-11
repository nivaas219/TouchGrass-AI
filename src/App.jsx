
import { useEffect, useState } from "react";
import "./App.css";

const missions = [
  {
    id: 1,
    title: "Touch the Grass",
    category: "Nature",
    minutes: 10,
    icon: "🌱",
    description: "Step outside and notice the plants, trees, and sky around you.",
    moods: ["😴 Low energy", "😌 Calm", "😵 Stressed"],
  },
  {
    id: 2,
    title: "A Little Walk",
    category: "Movement",
    minutes: 15,
    icon: "🚶",
    description: "Take a relaxed walk without scrolling on your phone.",
    moods: ["⚡ Energetic", "😌 Calm"],
  },
  {
    id: 3,
    title: "Find Five Things",
    category: "Discovery",
    minutes: 10,
    icon: "🍃",
    description: "Find five things in nature you normally walk past.",
    moods: ["😌 Calm", "😵 Stressed"],
  },
  {
    id: 4,
    title: "Sky Watch",
    category: "Mindfulness",
    minutes: 5,
    icon: "☁️",
    description: "Look at the sky, watch the clouds, and breathe slowly.",
    moods: ["😴 Low energy", "😌 Calm", "😵 Stressed"],
  },
  {
    id: 5,
    title: "Outdoor Reading",
    category: "Mindfulness",
    minutes: 15,
    icon: "📖",
    description: "Read a few pages of a book in a comfortable outdoor spot.",
    moods: ["😴 Low energy", "😌 Calm"],
  },
  {
    id: 6,
    title: "Nature Photographer",
    category: "Creativity",
    minutes: 10,
    icon: "📸",
    description: "Capture three interesting details from the world around you.",
    moods: ["⚡ Energetic", "😌 Calm"],
  },
  {
    id: 7,
    title: "Care for a Plant",
    category: "Nature",
    minutes: 15,
    icon: "🪴",
    description: "Water a plant or spend a few minutes caring for a garden.",
    moods: ["😴 Low energy", "😌 Calm"],
  },
  {
    id: 8,
    title: "Connect with Someone",
    category: "Connection",
    minutes: 10,
    icon: "💚",
    description: "Meet a friend or have a real conversation outside.",
    moods: ["⚡ Energetic", "😵 Stressed"],
  },
];

const moods = ["😴 Low energy", "😌 Calm", "⚡ Energetic", "😵 Stressed"];

function todayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function readProgress() {
  const fallback = {
    completed: [],
    minutes: 0,
    streak: 0,
    lastVisit: "",
  };

  try {
    const saved = localStorage.getItem("touchgrass-progress");
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);

    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      minutes: Number(parsed.minutes) || 0,
      streak: Number(parsed.streak) || 0,
      lastVisit: typeof parsed.lastVisit === "string" ? parsed.lastVisit : "",
    };
  } catch {
    return fallback;
  }
}

export default function App() {
  const [progress, setProgress] = useState(readProgress);
  const [mood, setMood] = useState("😌 Calm");
  const [availableTime, setAvailableTime] = useState("15");
  const [activeMission, setActiveMission] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("touchgrass-progress", JSON.stringify(progress));
  }, [progress]);

  const today = todayKey();

  const completedToday = progress.completed.filter(function (item) {
    return item.date === today;
  });

  const recommendations = missions
    .filter(function (mission) {
      return mission.minutes <= Number(availableTime);
    })
    .sort(function (a, b) {
      const aMatches = a.moods.includes(mood) ? 1 : 0;
      const bMatches = b.moods.includes(mood) ? 1 : 0;

      if (aMatches !== bMatches) return bMatches - aMatches;

      const aDone = progress.completed.some(function (item) {
        return item.id === a.id && item.date === today;
      });

      const bDone = progress.completed.some(function (item) {
        return item.id === b.id && item.date === today;
      });

      return Number(aDone) - Number(bDone);
    });

  function finishMission(mission) {
    const alreadyDone = progress.completed.some(function (item) {
      return item.id === mission.id && item.date === today;
    });

    if (alreadyDone) {
      setNotice("You have already completed this mission today. 🌿");
      setActiveMission(null);
      return;
    }

    setProgress(function (previous) {
      const nextStreak =
        previous.lastVisit === today
          ? previous.streak
          : previous.lastVisit === yesterdayKey()
            ? previous.streak + 1
            : 1;

      return {
        completed: [
          ...previous.completed,
          { id: mission.id, title: mission.title, date: today },
        ],
        minutes: previous.minutes + mission.minutes,
        streak: nextStreak,
        lastVisit: today,
      };
    });

    setNotice("Lovely work! You made time for the real world. 💚");
    setActiveMission(null);
  }

  function resetProgress() {
    const confirmed = window.confirm(
      "Reset all your TouchGrass progress? This cannot be undone."
    );

    if (!confirmed) return;

    setProgress({
      completed: [],
      minutes: 0,
      streak: 0,
      lastVisit: "",
    });

    setNotice("Your progress has been reset.");
  }

  const visibleMissions = showAll
    ? recommendations
    : recommendations.slice(0, 4);

  return (
    <main className="app-shell" id="home">
      <nav className="navbar">
        <a className="brand" href="#home" aria-label="TouchGrass AI home">
          <span className="brand-icon">✳</span>
          touchgrass<span className="brand-ai">.ai</span>
        </a>

        <span className="nav-note">
          <span className="live-dot" />
          Your reminder to log off
        </span>

        <a
          className="github-link"
          href="https://github.com/nivaas219/TouchGrass-AI"
          target="_blank"
          rel="noreferrer"
        >
          View project ↗
        </a>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span>✳</span> YOUR OUTSIDE ERA STARTS HERE
          </div>

          <h1>
            Your world is
            <br />
            bigger than
            <br />
            <span>your screen.</span>
          </h1>

          <p>
            Little adventures. Fresh air. A life beyond the scroll. Find one
            small reason to step outside today.
          </p>

          <a className="primary-button" href="#missions">
            Find my next adventure <span>↗</span>
          </a>

          <div className="hero-footnote">
            No pressure. No perfection. Just go outside.
          </div>
        </div>

        <div className="hero-art" aria-label="Illustrated sunny green hills">
          <div className="sun" />
          <div className="cloud cloud-one" />
          <div className="cloud cloud-two" />
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <span className="flower flower-one">✿</span>
          <span className="flower flower-two">✿</span>
          <span className="flower flower-three">✿</span>
          <div className="art-label">
            <span>✳</span> a little more outside
          </div>
        </div>
      </section>

      <section className="stats" aria-label="Your outdoor progress">
        <div className="stat">
          <span className="stat-icon">🌿</span>
          <div>
            <strong>{progress.minutes}</strong>
            <span>Outdoor minutes</span>
          </div>
        </div>

        <div className="stat">
          <span className="stat-icon">☀️</span>
          <div>
            <strong>{progress.completed.length}</strong>
            <span>Missions completed</span>
          </div>
        </div>

        <div className="stat">
          <span className="stat-icon">🔥</span>
          <div>
            <strong>{progress.streak}</strong>
            <span>Day streak</span>
          </div>
        </div>

        <div className="stat">
          <span className="stat-icon">💚</span>
          <div>
            <strong>{completedToday.length}</strong>
            <span>Done today</span>
          </div>
        </div>
      </section>

      <section className="mission-section" id="missions">
        <div className="section-heading">
          <div>
            <div className="eyebrow">THE REAL-WORLD RESET</div>
            <h2>What's your vibe today?</h2>
            <p>
              Choose your mood and available time to find a little adventure.
            </p>
          </div>
          <span className="section-decoration" aria-hidden="true">
            ✳
          </span>
        </div>

        <div className="mood-picker" aria-label="Choose your mood">
          {moods.map(function (item) {
            const selected = mood === item;

            return (
              <button
                key={item}
                type="button"
                onClick={function () {
                  setMood(item);
                }}
                className={selected ? "mood-chip selected" : "mood-chip"}
                aria-pressed={selected}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="time-picker">
          <label htmlFor="time">I have</label>
          <select
            id="time"
            value={availableTime}
            onChange={function (event) {
              setAvailableTime(event.target.value);
              setShowAll(false);
            }}
          >
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
          </select>
          <span>to spend outside</span>
        </div>

        <div className="mission-grid">
          {visibleMissions.map(function (mission) {
            const done = progress.completed.some(function (item) {
              return item.id === mission.id && item.date === today;
            });

            return (
              <article
                className={done ? "mission-card mission-done" : "mission-card"}
                key={mission.id}
              >
                <div className="card-top">
                  <span className="mission-icon">{mission.icon}</span>
                  <span className="duration">{mission.minutes} MIN</span>
                </div>

                <div className="category">{mission.category}</div>
                <h3>{mission.title}</h3>
                <p>{mission.description}</p>

                <button
                  type="button"
                  className={done ? "done-button" : "mission-button"}
                  onClick={function () {
                    setNotice("");
                    setActiveMission(mission);
                  }}
                >
                  {done ? "✓ Completed today" : "Let's do this →"}
                </button>
              </article>
            );
          })}
        </div>

        {recommendations.length === 0 && (
          <p className="empty-state">
            Try adding a few more minutes to discover an adventure. 🌿
          </p>
        )}

        {recommendations.length > 4 && (
          <button
            className="show-more"
            type="button"
            onClick={function () {
              setShowAll(!showAll);
            }}
          >
            {showAll ? "Show less ↑" : "Explore all missions ↓"}
          </button>
        )}

        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button
              type="button"
              onClick={function () {
                setNotice("");
              }}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}
      </section>

      <section className="quote-banner">
        <span className="quote-mark">“</span>
        <div>
          <p>
            Sometimes the best thing you can do for your mind is give your eyes
            something real to look at.
          </p>
          <span>A LITTLE REMINDER FROM YOUR FUTURE SELF</span>
        </div>
        <span className="quote-leaf" aria-hidden="true">
          ❋
        </span>
      </section>

      <footer>
        <a className="brand footer-brand" href="#home">
          ✳ touchgrass<span className="brand-ai">.ai</span>
        </a>
        <span>Made for a world beyond the scroll. 🌎</span>
        <span>Hacktoberfest 2026 · Week 1</span>
        <button className="reset-button" type="button" onClick={resetProgress}>
          Reset progress
        </button>
      </footer>

      {activeMission && (
        <div
          className="modal-backdrop"
          onClick={function () {
            setActiveMission(null);
          }}
        >
          <section
            className="mission-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={function (event) {
              event.stopPropagation();
            }}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close"
              onClick={function () {
                setActiveMission(null);
              }}
            >
              ×
            </button>

            <div className="modal-emoji">{activeMission.icon}</div>
            <div className="eyebrow">YOUR NEXT LITTLE ADVENTURE</div>
            <h2 id="modal-title">{activeMission.title}</h2>
            <p>{activeMission.description}</p>

            <div className="modal-tip">
              🌿 Mood check: {mood}. Stay safe, take your time, and enjoy the
              moment.
            </div>

            <button
              className="primary-button modal-action"
              type="button"
              onClick={function () {
                finishMission(activeMission);
              }}
            >
              I did it! +{activeMission.minutes} minutes ✓
            </button>

            <button
              className="cancel-button"
              type="button"
              onClick={function () {
                setActiveMission(null);
              }}
            >
              Maybe later
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
