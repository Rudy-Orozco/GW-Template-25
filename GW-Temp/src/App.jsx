import { useState, useRef, useEffect } from "react"

import "./styles/tokens.css"
import "./styles/layout.css"
import "./styles/header.css"
import "./styles/buttons.css"
import "./styles/banner.css"
import "./styles/cards.css"
import "./styles/modals.css"

const characterImages = import.meta.glob('./assets/characters/*.{png,jpg,jpeg,webp}', { eager: true })

// ── SVG Icons ──────────────────────────────────────────────────────────────

const IconSun = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const IconMoon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const IconStar = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconX = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const IconCheck = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconMinus = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Constants ──────────────────────────────────────────────────────────────

const HOW_TO = [
  ["Click a card",        "Cycles the state: Normal → Eliminated (X) → Confirmed (O) → Normal."],
  ["Quick-action tabs",   "Hover a card to reveal X, O, and Reset buttons on the right edge."],
  ["Full image preview",  "Click the zoom icon on the top-left of any card to view it enlarged."],
  ["Set Favorite",        "Activate 'Set Favorite', then click any card to mark it as your pick."],
  ["Clear Board",         "Hold the Clear Board button until filled to reset everything."],
]

// ── Component ──────────────────────────────────────────────────────────────

export default function App() {   
  const characters = Object.keys(characterImages).map((path) => {
    const str = path.split('/').pop().replace(/\.(png|jpg|jpeg|webp)$/i, '')
    const parts = str.split('||');
    const name = parts[0];
    const artist = "Artist: " + (parts[1] || '---');
    const img  = characterImages[path].default
    return { name, img, artist}
  })

  const [darkMode,    setDarkMode]    = useState(true)
  const [cardStates,  setCardStates]  = useState(
    characters.reduce((acc, c) => { acc[c.name] = 'normal'; return acc }, {})
  )
  const [favoriteCard,  setFavoriteCard]  = useState(null)
  const [favoriteMode,  setFavoriteMode]  = useState(false)
  const [showHowTo,     setShowHowTo]     = useState(false)
  const [holdProgress,  setHoldProgress]  = useState(0)
  const [modalImage,    setModalImage]    = useState(null)
  const [modalVisible,  setModalVisible]  = useState(false)

  const holdInterval = useRef(null)

  // Card click — cycle state or assign favorite
  const toggleCard = (name) => {
    if (favoriteMode) {
      setFavoriteCard(name)
      setFavoriteMode(false)
      return
    }
    setCardStates(prev => ({
      ...prev,
      [name]: prev[name] === 'normal' ? 'red' : prev[name] === 'red' ? 'green' : 'normal',
    }))
  }

  // Hold-to-clear
  const clearBoard = () => {
    setCardStates(characters.reduce((acc, c) => { acc[c.name] = 'normal'; return acc }, {}))
    setFavoriteCard(null)
    setFavoriteMode(false)
  }

  const startHold = () => {
    const t0 = Date.now()
    holdInterval.current = setInterval(() => {
      const p = Math.min((Date.now() - t0) / 1000, 1)
      setHoldProgress(p * 100)
      if (p >= 1) { clearInterval(holdInterval.current); setHoldProgress(0); clearBoard() }
    }, 50)
  }

  const endHold = () => {
    clearInterval(holdInterval.current)
    setHoldProgress(0)
  }

  // Delayed modal unmount (allows fade-out animation to finish)
  useEffect(() => {
    if (!modalVisible && modalImage) {
      const t = setTimeout(() => setModalImage(null), 280)
      return () => clearTimeout(t)
    }
  }, [modalVisible])

  // Derive card CSS class from state
  const cardClass = (name) => {
    if (name === favoriteCard)        return 's-fav'
    if (cardStates[name] === 'red')   return 's-red'
    if (cardStates[name] === 'green') return 's-green'
    return ''
  }

  // Open image modal
  const openModal = (img) => {
    setModalImage(img)
    setTimeout(() => setModalVisible(true), 10)
  }

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="wrap">

        {/* ── Header ── */}
        <header className="hdr">
          <div>
            <div className="brand-pill">Lia Presents...</div>
            <h1 className="brand-title">Guess the VTuber</h1>
            <p className="brand-sub">v03.26 · By LiaNweVT · Developed by REKAA_85</p>
          </div>

          <div className="btn-row">
            <button className="btn" onClick={() => setDarkMode(d => !d)}>
              {darkMode ? <IconSun /> : <IconMoon />}
              {darkMode ? 'Light' : 'Dark'}
            </button>

            <button
              className="btn btn-clear"
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
            >
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                Clear Board
                <span style={{ fontSize: 11, opacity: 0.45 }}>hold</span>
              </span>
              <div className="btn-clear-fill" style={{ width: `${holdProgress}%` }} />
            </button>

            <button
              className={`btn btn-fav ${favoriteMode ? 'active' : ''}`}
              onClick={() => setFavoriteMode(m => !m)}
            >
              <IconStar />
              {favoriteMode ? 'Selecting…' : 'Set Favorite'}
            </button>

            <button className="btn btn-lime" onClick={() => setShowHowTo(true)}>
              How to Play
            </button>
          </div>
        </header>

        {/* ── Favorite banner ── */}
        <div className="fav-banner">
          <span className="fav-label">Your VTuber</span>
          <div className="fav-divider" />
          {favoriteCard
            ? <span className="fav-name">{favoriteCard}</span>
            : <span className="fav-none">None selected</span>
          }
        </div>

        {/* ── Card grid ── */}
        <div className="grid">
          {characters.map((char) => (
            <div
              key={char.name}
              className={`card ${cardClass(char.name)}`}
              onClick={() => toggleCard(char.name)}
            >
              {/* Favorite chip */}
              {favoriteCard === char.name && (
                <div className="c-fav-chip"><IconStar size={11} /></div>
              )}

              {/* Zoom button */}
              <button
                className="c-zoom"
                onClick={(e) => { e.stopPropagation(); openModal(char.img) }}
              >
                <IconSearch />
              </button>

              {/* Image + state overlay */}
              <div className="c-img-wrap">
                <img src={char.img} alt={char.name} draggable={false} />
                {cardStates[char.name] === 'red' && (
                  <div className="state-ov">
                    <div className="badge-x"><IconX size={20} /></div>
                  </div>
                )}
                {cardStates[char.name] === 'green' && (
                  <div className="state-ov">
                    <div className="badge-o"><IconCheck size={20} /></div>
                  </div>
                )}
              </div>

              {/* Name & Artist */}
              <p className="c-name">{char.name}</p>
              <p className="c-artist">{char.artist}</p>

              {/* Side action tabs */}
              <div className="side-tabs">
                <button
                  className="stab stab-x"
                  onClick={(e) => { e.stopPropagation(); setCardStates(p => ({ ...p, [char.name]: 'red' })) }}
                >
                  <IconX />
                </button>
                <button
                  className="stab stab-o"
                  onClick={(e) => { e.stopPropagation(); setCardStates(p => ({ ...p, [char.name]: 'green' })) }}
                >
                  <IconCheck />
                </button>
                <button
                  className="stab stab-r"
                  onClick={(e) => { e.stopPropagation(); setCardStates(p => ({ ...p, [char.name]: 'normal' })) }}
                >
                  <IconMinus />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <footer className="footer">
          <p>© 2025 REKAA_85. All rights reserved for the original code, web design, and modifications.</p>
          <p>Third-party assets are used with permission and remain the property of their original owners/creators.</p>
          <p>No part of this project may be reproduced or modified without explicit authorization. AI training is strictly forbidden.</p>
        </footer>

      </div>

      {/* ── Image preview modal ── */}
      {modalImage && (
        <div
          className={`mbackdrop ${modalVisible ? '' : 'out'}`}
          onClick={() => setModalVisible(false)}
        >
          <div className="mbox" onClick={(e) => e.stopPropagation()}>
            <div className="mhdr">
              <span className="mtitle">Preview</span>
              <button className="mclose" onClick={() => setModalVisible(false)}>
                <IconClose />
              </button>
            </div>
            <div className="mimg">
              <img src={modalImage} alt="Preview" draggable={false} />
            </div>
          </div>
        </div>
      )}

      {/* ── How to Play modal ── */}
      {showHowTo && (
        <div className="mbackdrop" onClick={() => setShowHowTo(false)}>
          <div className="mbox" onClick={(e) => e.stopPropagation()}>
            <div className="mhdr">
              <span className="mtitle">How to Play</span>
              <button className="mclose" onClick={() => setShowHowTo(false)}>
                <IconClose />
              </button>
            </div>

            <div className="htp-list">
              {HOW_TO.map(([title, desc], i) => (
                <div className="htp-item" key={i}>
                  <div className="htp-num">{i + 1}</div>
                  <p className="htp-text"><strong>{title} — </strong>{desc}</p>
                </div>
              ))}
            </div>

            <button
              className="btn btn-lime"
              style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
              onClick={() => setShowHowTo(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
